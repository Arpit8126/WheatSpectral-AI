import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

# ============================================================
# ARCHITECTURE (Exact copy from provided training code)
# ============================================================

class AxialAttention(nn.Module):
    def __init__(self, dim, num_heads=8, dropout=0.1):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = dim // num_heads
        self.scale = self.head_dim ** -0.5
        
        self.qkv = nn.Linear(dim, dim * 3, bias=False)
        self.proj = nn.Linear(dim, dim)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x):
        B, N, C = x.shape
        qkv = self.qkv(x).reshape(B, N, 3, self.num_heads, self.head_dim).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]
        
        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = attn.softmax(dim=-1)
        attn = self.dropout(attn)
        
        x = (attn @ v).transpose(1, 2).reshape(B, N, C)
        x = self.proj(x)
        return x

class TransformerEncoder(nn.Module):
    def __init__(self, dim=256, depth=2, num_heads=8, mlp_ratio=4., dropout=0.1):
        super().__init__()
        self.pos_embedding = nn.Parameter(torch.randn(1, 1, dim) * 0.02)
        self.transformer_blocks = nn.ModuleList([
            nn.ModuleDict({
                'norm1': nn.LayerNorm(dim),
                'attn': AxialAttention(dim, num_heads=num_heads, dropout=dropout),
                'norm2': nn.LayerNorm(dim),
                'mlp': nn.Sequential(
                    nn.Linear(dim, int(dim * mlp_ratio)),
                    nn.GELU(),
                    nn.Dropout(dropout),
                    nn.Linear(int(dim * mlp_ratio), dim),
                    nn.Dropout(dropout)
                )
            }) for _ in range(depth)
        ])
        
    def forward(self, x):
        # x: [B, 256] -> [B, 1, 256]
        x = x.unsqueeze(1) + self.pos_embedding
        for block in self.transformer_blocks:
            x_norm = block['norm1'](x)
            x = x + block['attn'](x_norm)
            x_norm = block['norm2'](x)
            x = x + block['mlp'](x_norm)
        return x.squeeze(1)  # [B, 256]

class SpectralEncoder(nn.Module):
    def __init__(self, in_ch=204, hidden=128):
        super().__init__()
        self.conv1 = nn.Conv1d(in_ch, hidden, kernel_size=5, padding=2)
        self.bn1 = nn.BatchNorm1d(hidden)
        self.conv2 = nn.Conv1d(hidden, hidden, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm1d(hidden)

    def forward(self, x):
        # x: [B,204,48,352] -> [B,204]
        b, c, h, w = x.shape
        x = x.view(b, c, -1).mean(-1)   # [B,204]
        x = x.unsqueeze(-1)             # [B,204,1]
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = x.squeeze(-1)               # [B,hidden]
        return x

class SpatialEncoder(nn.Module):
    def __init__(self, hidden=128):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.conv3 = nn.Conv2d(64, hidden, 3, padding=1)
        self.bn3 = nn.BatchNorm2d(hidden)
        self.pool = nn.AdaptiveAvgPool2d(1)

    def forward(self, x):
        # x: [B,204,48,352]
        x = x.mean(1, keepdim=True)        # [B,1,48,352]
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.max_pool2d(x, 2)             # [B,32,24,176]
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.max_pool2d(x, 2)             # [B,64,12,88]
        x = F.relu(self.bn3(self.conv3(x)))# [B,H,12,88]
        x = self.pool(x).view(x.size(0), -1)  # [B,hidden]
        return x

class FusionNet(nn.Module):
    def __init__(self, n_classes=4, reg_dim=4, hidden=128):
        super().__init__()
        self.spec_enc = SpectralEncoder(in_ch=204, hidden=hidden)
        self.spat_enc = SpatialEncoder(hidden=hidden)

        self.gate = nn.Linear(2 * hidden, 2 * hidden)
        self.fc_shared = nn.Linear(2 * hidden, 256)
        
        # Axial Attention Transformer Encoder after fusion
        self.transformer = TransformerEncoder(dim=256, depth=2, num_heads=8)

        self.cls_head = nn.Linear(256, n_classes)
        self.reg_head = nn.Linear(256, reg_dim)

    def forward(self, x):
        spec = self.spec_enc(x)
        spat = self.spat_enc(x)
        fused = torch.cat([spec, spat], dim=1)   # [B,2H]
        g = torch.sigmoid(self.gate(fused))
        fused = fused * g
        fused = F.relu(self.fc_shared(fused))
        
        # Apply Axial Attention Transformer
        fused = self.transformer(fused)
        
        logits = self.cls_head(fused)
        reg = self.reg_head(fused)
        return logits, reg

# ============================================================
# STATS & UTILS
# ============================================================

# CORRECT Normalization stats (Calculated from train.csv)
# Order: ["GrainWeight", "Gsw", "PhiPS2", "Fertilizer"]
REG_MEAN = np.array([6355.478, 0.0580, 0.5530, 0.5786], dtype=np.float32)
REG_STD = np.array([2109.6545, 0.0307, 0.1059, 0.4678], dtype=np.float32)

CULTIVAR_NAMES = ["Heerup", "Kvium", "Rembrandt", "Sheriff"]
REG_NAMES = ["GrainWeight", "Gsw", "PhiPS2", "Fertilizer"]

def preprocess_image(image_array):
    """
    Preprocess numpy array of shape [204, 48, 352]
    """
    # Normalize to 0-1 if not already
    if image_array.max() > 1:
        image_array = image_array.astype(np.float32) / image_array.max()
    
    # Make contiguous
    image_array = np.ascontiguousarray(image_array)
    # Convert to tensor: [1, 204, 48, 352]
    tensor = torch.from_numpy(image_array).unsqueeze(0).float()
    return tensor
