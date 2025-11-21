'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    linkText?: string;
    linkUrl?: string;
    centered?: boolean;
}

export default function SectionHeader({
    title,
    subtitle,
    linkText,
    linkUrl,
    centered = false
}: SectionHeaderProps) {
    return (
        <div className={`flex flex-col ${centered ? 'items-center text-center' : 'items-start'} mb-8 md:mb-12`}>
            {subtitle && (
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {subtitle}
                </span>
            )}

            <div className={`w-full flex flex-col md:flex-row ${centered ? 'justify-center' : 'justify-between'} items-end gap-4`}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {title}
                </h2>

                {linkText && linkUrl && (
                    <Link
                        href={linkUrl}
                        className="group flex items-center text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
                    >
                        {linkText}
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}
            </div>
        </div>
    );
}
