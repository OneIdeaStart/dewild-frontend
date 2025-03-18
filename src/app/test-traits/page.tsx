// src/app/test-traits/page.tsx
'use client'

import { useState } from 'react'

export default function TestTraitsPage() {
  const [prompt, setPrompt] = useState('')
  const [traits, setTraits] = useState<any>(null)

  const extractTraitsFromPrompt = (promptText: string) => {
    let animal = 'UNKNOWN';
    if (promptText.match(/robot\s+wild\s+boar/i)) {
      animal = 'WILD BOAR';
    } else {
      // Regular search for single word after "robot"
      const animalMatch = promptText.match(/robot\s+(\w+)/i);
      if (animalMatch) {
        animal = animalMatch[1].toUpperCase();
      }
    }
    
    // Extract material color and material
    const materialColorMatch = promptText.match(/sleek\s+(\w+)/i);
    const materialColor = materialColorMatch ? materialColorMatch[1].toUpperCase() : 'UNKNOWN';
    
    // Check if material color is special (silver, golden, bronze)
    const isSpecialMaterial = ['SILVER', 'GOLDEN', 'BRONZE'].includes(materialColor);
    
    // For regular materials look for second word after "sleek"
    let materialMatch = promptText.match(/sleek\s+\w+\s+(\w+)/i);
    let material = materialMatch ? materialMatch[1].toUpperCase() : 'UNKNOWN';
    
    // If this is a special material OR regular material not found
    if (isSpecialMaterial) {
      material = materialColor; // For special materials use color as material
    }
    
    // Background
    const backgroundMatch = promptText.match(/(\w+)\s+background/i);
    const background = backgroundMatch ? backgroundMatch[1].toUpperCase() : 'UNKNOWN';
    
    // Pattern color for regular prompts
    let patternColor;
    if (isSpecialMaterial) {
      patternColor = materialColor; // For special materials use material color
    } else {
      // Look for "with [color]" or "[color] 'Your text here'"
      const patternColorMatch = promptText.match(/with\s+(\w+)|(\w+)\s+['"]Your text here['"]/i);
      if (patternColorMatch) {
        for (let i = 1; i < patternColorMatch.length; i++) {
          if (patternColorMatch[i]) {
            patternColor = patternColorMatch[i].toUpperCase();
            break;
          }
        }
      } else {
        patternColor = 'UNKNOWN';
      }
    }
    
    // Eye color
    const eyesColorMatch = promptText.match(/(\w+)\s+glowing/i);
    const eyesColor = eyesColorMatch ? eyesColorMatch[1].toUpperCase() : 'UNKNOWN';
    
    return {
      animal,
      material,
      material_color: materialColor, 
      background,
      pattern_color: patternColor,
      eyes_color: eyesColor
    };
  };

  const handleExtract = () => {
    const result = extractTraitsFromPrompt(prompt);
    setTraits(result);
  }

  const handleQuickTest = (index: number) => {
    const testPrompts = [
      "portrait of a sleek yellow metallic robot duck with red 'Your text here' words artistic graffiti typographic painted pattern, full-body typographic graffiti art, two-thirds view to the right, profile picture, passport photo, human robot body, colorful robot parts, blue background, purple glowing detailed eyes, octane render, volumetric lighting, highly detailed, masterpiece, best quality, no blur",
      
      "portrait of a sleek silver robot bear with 'Your text here' words artistic graffiti typographic engraved pattern, full-body typographic graffiti art, two-thirds view to the right, profile picture, passport photo, human robot body, colorful robot parts, yellow background, blue glowing detailed eyes, octane render, volumetric lighting, highly detailed, masterpiece, best quality, no blur",
      
      "portrait of a sleek golden robot wolf with green 'Your text here' words artistic graffiti typographic painted pattern, full-body typographic graffiti art, two-thirds view to the right, profile picture, passport photo, human robot body, colorful robot parts, purple background, red glowing detailed eyes, octane render, volumetric lighting, highly detailed, masterpiece, best quality, no blur",
      
      "portrait of a sleek bronze robot tiger with blue 'Your text here' words artistic graffiti typographic engraved pattern, full-body typographic graffiti art, two-thirds view to the right, profile picture, passport photo, human robot body, colorful robot parts, green background, yellow glowing detailed eyes, octane render, volumetric lighting, highly detailed, masterpiece, best quality, no blur"
    ];
    
    setPrompt(testPrompts[index]);
    const result = extractTraitsFromPrompt(testPrompts[index]);
    setTraits(result);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Traits Extractor Tester</h1>
      
      <div className="mb-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button 
            onClick={() => handleQuickTest(0)} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Test Yellow Metallic
          </button>
          <button 
            onClick={() => handleQuickTest(1)} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Test Silver
          </button>
          <button 
            onClick={() => handleQuickTest(2)} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Test Golden
          </button>
          <button 
            onClick={() => handleQuickTest(3)} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Test Bronze
          </button>
        </div>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-32 p-2 border rounded"
          placeholder="Enter prompt to extract traits from..."
        />
      </div>
      
      <button 
        onClick={handleExtract}
        className="px-4 py-2 bg-green-500 text-white rounded mb-4"
      >
        Extract Traits
      </button>
      
      {traits && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Extracted Traits:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(traits, null, 2)}</pre>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Object.entries(traits).map(([key, value]) => (
              <div key={key} className="border p-3 rounded">
                <span className="font-bold uppercase">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}