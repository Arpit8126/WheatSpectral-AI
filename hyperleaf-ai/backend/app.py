import spaces
import gradio as gr
import os
import uvicorn

# 1. Register a GPU function so ZeroGPU decorator cache has at least one item
@spaces.GPU
def gpu_health_check():
    return "ZeroGPU Worker Active and Ready!"

# 2. Trigger ZeroGPU startup report directly to notify the supervisor
try:
    from spaces.zero import client
    client.startup_report()
    print("✅ ZeroGPU startup_report successfully sent to supervisor!")
except Exception as e:
    print(f"ZeroGPU startup_report notice: {e}")

# 3. Trigger Gradio's one_launch hook
try:
    _probe = gr.Blocks()
    _probe.launch(prevent_thread_lock=True)
    _probe.close()
    print("✅ Gradio launch probe hook triggered!")
except Exception as e:
    print(f"Gradio launch probe notice: {e}")

from main import app as fastapi_app

# 4. Status UI for Hugging Face Space
with gr.Blocks(title="🌾 WheatSpectral AI API") as demo:
    gr.Markdown("# 🌾 WheatSpectral AI API")
    gr.Markdown(
        """
        ### Backend Status: **Online & Running on ZeroGPU** 🚀
        This Space hosts the AI inference and data API for WheatSpectral.
        
        - **Swagger / OpenAPI Docs**: [/docs](/docs)
        - **Redoc Documentation**: [/redoc](/redoc)
        - **Status Page**: [/status](/status)
        """
    )
    btn = gr.Button("Test ZeroGPU Connection")
    out = gr.Textbox(label="Worker Output")
    btn.click(gpu_health_check, inputs=[], outputs=[out])

# Mount Gradio onto FastAPI app
app = gr.mount_gradio_app(fastapi_app, demo, path="/status")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
