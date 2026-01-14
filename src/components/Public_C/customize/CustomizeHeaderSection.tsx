import React from "react";

interface CustomizeHeaderSectionProps {
    category: string;
}

const CustomizeHeaderSection: React.FC<CustomizeHeaderSectionProps> = ({ category }) => {
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center py-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
                        Customize Your Look
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                        Select a Style to Personalize
                    </h2>
                    <p className="text-[#5D5D5D] md:text-base max-w-2xl mx-auto">
                        Discover vibrant clothes from skilled craftsmen to suit every of your event.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomizeHeaderSection;
