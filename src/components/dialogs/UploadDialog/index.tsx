// src/components/dialogs/UploadDialog/index.tsx (updated version)
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppKitAccount } from '@reown/appkit/react';
import { useCollabStatus } from '@/hooks/useCollabStatus';
import UploadSuccessDialog from '@/components/dialogs/UploadSuccessDialog';

interface UploadDialogProps {
  onClose: () => void;
  promptData?: {
    text: string;
    [key: string]: any;
  };
}

export default function UploadDialog({ onClose, promptData }: UploadDialogProps) {
    const { address } = useAppKitAccount();
    const { applicationData } = useCollabStatus();
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statement, setStatement] = useState('');
    const [traitsExpanded, setTraitsExpanded] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [traits, setTraits] = useState<{
      animal: string;
      material: string;
      material_color: string;
      background: string;
      pattern_color: string;
      eyes_color: string;
    } | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [fileSize, setFileSize] = useState<number>(0); // Add state for file size
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Extract traits from prompt when component loads
    useEffect(() => {
        if (promptData?.text) {
          console.log("Received prompt text:", promptData.text);
          extractTraitsFromPrompt(promptData.text);
        } else {
          console.log("No prompt data received:", promptData);
        }
    }, [promptData]);
  
    const extractTraitsFromPrompt = (promptText: string) => {
        console.log("Extracting traits from:", promptText);
        
        // Check for compound animal names
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
        let patternColor = 'UNKNOWN'; // Initialize with default value

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
        }
        }
        
        // Eye color
        const eyesColorMatch = promptText.match(/(\w+)\s+glowing/i);
        const eyesColor = eyesColorMatch ? eyesColorMatch[1].toUpperCase() : 'UNKNOWN';
        
        const extractedTraits = {
          animal,
          material,
          material_color: materialColor, 
          background,
          pattern_color: patternColor,
          eyes_color: eyesColor
        };  
        
        console.log("Extracted traits:", extractedTraits);
        setTraits(extractedTraits);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check that file is JPG
        if (file.type !== 'image/jpeg') {
            setUploadError('Please upload JPEG files only (file type: ' + file.type + ')');
            return;
        }

        // Check file size (maximum 1MB)
        const fileSizeInMB = file.size / (1024 * 1024);
        setFileSize(fileSizeInMB);
        
        if (fileSizeInMB > 1) {
            setUploadError(`File size exceeds 1MB limit (${fileSizeInMB.toFixed(2)}MB). Please resize your image.`);
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        try {
            // Convert to base64 for preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadError('Error processing image. Please try again.');
            setIsUploading(false);
        }
    };

    const validateSubmission = (): boolean => {
        // Check for image presence
        if (!uploadedImage) {
            setUploadError('Please upload an image first');
            return false;
        }

        // Check file size
        if (fileSize > 1) {
            setUploadError(`File size exceeds 1MB limit (${fileSize.toFixed(2)}MB). Please resize your image.`);
            return false;
        }

        // Check for statement presence
        if (!statement.trim()) {
            setUploadError('Please enter your statement');
            return false;
        }

        // If all checks passed
        return true;
    };

    const handleSubmit = async () => {
        // Reset error on new submission attempt
        setUploadError(null);

        // Check all conditions before sending
        if (!validateSubmission()) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Collect data for sending
            const submissionData = {
                image: uploadedImage,
                traits,
                statement,
                wallet: address
            };

            // Send data to server
            const response = await fetch('/api/nft/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }
            
            // Open successful upload dialog instead of alert
            setShowSuccessDialog(true);
        } catch (error: any) {
            console.error('Error submitting NFT:', error);
            setUploadError(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuccessDialogClose = () => {
        setShowSuccessDialog(false);
        onClose(); // Close main dialog
    };

    return (
        <>
          <div className="relative flex flex-col items-center w-full h-full overflow-auto">
            <div className="relative z-10 flex flex-col items-center gap-8 px-3 mt-20 sm:mt-8 w-full max-w-[448px] pb-10">
              {/* Header */}
              <div className="flex justify-between items-center w-full">
                <h1 className="text-[48px] font-extrabold uppercase leading-[48px]">
                  Upload Image
                </h1>
                <svg
                  onClick={onClose}
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                >
                  <path d="M12.4501 37.6501L10.3501 35.5501L21.9001 24.0001L10.3501 12.4501L12.4501 10.3501L24.0001 21.9001L35.5501 10.3501L37.6501 12.4501L26.1001 24.0001L37.6501 35.5501L35.5501 37.6501L24.0001 26.1001L12.4501 37.6501Z" fill="black" />
                </svg>
              </div>

              <div className="flex flex-col gap-3 w-full">
                {/* Step 1: Upload Image */}
                <div className="bg-[#6A35FF] p-4 rounded-[16px]">
                  <div className="flex justify-between items-center">
                    <div className="text-[#7EF3E1] text-[32px] leading-[32px] font-extrabold uppercase">
                      01. Upload Image
                    </div>
                    <Button
                      onClick={handleUploadClick}
                      variant="primary"
                      size="sm"
                      className="bg-black hover:bg-gray-800"
                      disabled={isUploading}
                    >
                      {isUploading ? 'UPLOADING...' : 'UPLOAD'}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg"
                     />
                  </div>
                  
                  {/* Additional information about image requirements */}
                  <div className="text-[#7EF3E1] text-[16px] mt-2 font-bold">
                    Requirements: JPEG format, max 1MB file size
                  </div>
                  
                  {/* Preview image if uploaded */}
                  {uploadedImage && (
                    <div className="mt-4 flex justify-center">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded NFT" 
                        className="max-h-[416px] object-contain rounded-[8px]"
                      />
                    </div>
                  )}
                </div>

                {/* Step 2: Check Traits */}
                <div className="bg-[#FF92B9] p-4 rounded-[16px]">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setTraitsExpanded(!traitsExpanded)}
                  >
                    <div className="text-[#026551] text-[32px] leading-[32px] font-extrabold uppercase">
                      02. Check Traits
                    </div>
                    <div className="text-[#026551]">
                      {traitsExpanded ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 15L12 9L18 15" stroke="#026551" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="#026551" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {traitsExpanded && traits && (
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-3">
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Animal</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{traits.animal}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Material</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{traits.material}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Material Color</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{traits.material_color}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Background</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{traits.background}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Pattern Color</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{traits.pattern_color}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Eyes Color</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{traits.eyes_color}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Artist</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">
                        @{applicationData?.twitter || 'unknown'}
                      </div>
                    </div>
                  )}
                  
                  {traitsExpanded && !traits && (
                    <div className="text-[#026551] text-[18px] leading-[24px] mt-3">
                      No traits found. Check console for debugging information.
                    </div>
                  )}
                </div>

                {/* Step 3: Your Statement */}
                <div className="bg-[#F9E52C] p-4 rounded-[16px]">
                  <div className="text-[#48926D] text-[32px] leading-[32px] font-extrabold uppercase mb-3">
                    03. Your Statement
                  </div>
                  <input
                    type="text"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    placeholder="Enter your statement here..."
                    className="w-full bg-white text-black py-2 px-3 rounded-[12px] border border-black font-['Sofia Sans Extra Condensed'] text-[24px] leading-[24px] font-extrabold uppercase"
                    maxLength={100}
                  />
                  <div className="text-[#48926D] text-[16px] mt-2 font-bold">
                    {statement.length}/100 characters
                  </div>
                </div>
              </div>

              <div className="relative w-full max-w-[448px] flex flex-col gap-6">
                {/* Error block */}
                {uploadError && (
                  <div className="absolute top-[-48px] left-[50%] transform -translate-x-[50%] flex flex-col items-center z-10">
                    <div className="bg-[#D90004] rounded-[8px] px-4 py-2 text-white text-[16px] font-extrabold uppercase text-center whitespace-nowrap">
                      {uploadError}
                    </div>
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#D90004] mt-[-1px]"></div>
                  </div>
                )}
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  className="bg-black hover:bg-gray-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      SUBMITTING...
                    </span>
                  ) : 'SEND FOR APPROVAL'}
                </Button>
                <button
                  onClick={onClose}
                  className="text-black text-[24px] font-extrabold uppercase"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>

          {/* Successful upload dialog */}
          <UploadSuccessDialog 
            isOpen={showSuccessDialog}
            onClose={handleSuccessDialogClose}
          />
        </>
    );
}