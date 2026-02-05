import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
            <Navbar />
            <main className="pt-16">
                {children}
            </main>
            <footer className="border-t border-border py-8 bg-muted/30">
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    <p>© 2024 HyperLeaf AI. Hyperspectral Wheat Analysis Platform.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
