import React from 'react';
import { Mail, Github, Twitter, MapPin } from 'lucide-react';

const Contact = () => {
    return (
        <div className="container px-4 py-12 mx-auto">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
                <p className="text-muted-foreground mb-12">
                    Interested in our research or deploying HyperLeaf AI in your agricultural pipeline?
                </p>

                <div className="bg-card border border-border rounded-xl p-8 shadow-sm text-left">
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">First Name</label>
                                <input type="text" className="w-full px-4 py-2 rounded-md border border-input bg-background" placeholder="Jane" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Name</label>
                                <input type="text" className="w-full px-4 py-2 rounded-md border border-input bg-background" placeholder="Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-2 rounded-md border border-input bg-background" placeholder="jane@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea className="w-full px-4 py-2 rounded-md border border-input bg-background h-32" placeholder="Tell us about your project..."></textarea>
                        </div>
                        <button type="button" className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
