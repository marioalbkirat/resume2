"use client";
import SectionBuilderUI from '@/hooks/sectionBuilder/SectionBuilderUI';

export default function Home() {
  return (
    <SectionBuilderUI
      sectionName="My Section"
      onExport={(data) => console.log(data)}
    />
  );
}