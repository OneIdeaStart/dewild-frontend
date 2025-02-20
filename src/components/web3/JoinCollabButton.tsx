// src/components/web3/JoinCollabButton.tsx
'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function JoinCollabButton() {
    const router = useRouter()

    const handleClick = () => {
        router.push('/dashboard')
    }   

    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <div className="button-container">
                    <Button
                        onClick={handleClick}
                        variant="primary"
                        size="lg"
                    >
                        Join DeWild Collab App
                    </Button>
                    <div className="reflect-effect"></div>
                </div>
            </div>
        </div>
    )
}