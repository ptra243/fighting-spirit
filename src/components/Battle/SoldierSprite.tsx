import React, {useEffect, useState} from 'react';
import styled from 'styled-components';

export enum SoldierAnimation {
    IDLE = 'idle',
    WALKING = 'walking',
    ATTACK1 = 'attack1',
    ATTACK2 = 'attack2',
    ALT_ATTACK = 'altAttack',
    TAKE_DAMAGE = 'takeDamage',
    DEFEAT = 'defeat'
}

interface SpriteConfig {
    animations: Record<SoldierAnimation, {
        row: number;
        frames: number;
    }>;
}

const SPRITE_CONFIG: SpriteConfig = {
    animations: {
        [SoldierAnimation.IDLE]: {row: 0, frames: 6},
        [SoldierAnimation.WALKING]: {row: 1, frames: 8},
        [SoldierAnimation.ATTACK1]: {row: 2, frames: 6},
        [SoldierAnimation.ATTACK2]: {row: 3, frames: 6},
        [SoldierAnimation.ALT_ATTACK]: {row: 4, frames: 9},
        [SoldierAnimation.TAKE_DAMAGE]: {row: 5, frames: 4},
        [SoldierAnimation.DEFEAT]: {row: 6, frames: 4}
    }
};

interface SoldierSpriteProps {
    animation: SoldierAnimation;
    frameRate?: number;
    isPlaying?: boolean;
    showDebugControls?: boolean;
    spriteSheet?: string;
    isPlayerCharacter?: boolean
    frameWidth?: number;
    frameHeight?: number;
    scale?: number;
}

const DEFAULT_SOLDIER_SPRITE_PROPS = {
    animation: SoldierAnimation.IDLE,
    frameRate: 100,
    isPlaying: true,
    showDebugControls: false,
    spriteSheet: "/src/images/Characters/Orc/Orc/Orc.png",
    isPlayerCharacter: false,
    frameWidth: 100,
    frameHeight: 100,
    scale: 2
} as const;


const SpriteContainer = styled.div`
    width: 100px;
    height: 100px;
    overflow: hidden;
    position: relative;
`;

const SpriteImage = styled.img`
    position: absolute;
    width: auto;
    height: auto;
    left: 0;
    top: 0;
    transform-origin: top left;
`;

// spriteSheet = "/src/images/Characters/Orc/Orc/Orc.png"
// spriteSheet = "/src/images/Characters/Soldier/Soldier/Soldier.png"
export const SoldierSprite: React.FC<SoldierSpriteProps> = (props) => {
    const {
        animation,
        frameRate,
        isPlaying: initialIsPlaying,
        showDebugControls,
        spriteSheet,
        isPlayerCharacter,
        frameHeight,
        frameWidth,
        scale
    } = {...DEFAULT_SOLDIER_SPRITE_PROPS, ...props}

    {
        const [currentFrame, setCurrentFrame] = useState(0);
        const [currentAnimation, setCurrentAnimation] = useState(animation);
        const [isPlaying, setIsPlaying] = useState(initialIsPlaying);

        const getFramePosition = (frame: number) => ({
            x: frame * frameWidth * scale,
            y: SPRITE_CONFIG.animations[currentAnimation].row * frameHeight * scale
        });

        const [position, setPosition] = useState(getFramePosition(0));

        useEffect(() => {
            setCurrentAnimation(animation);
            setCurrentFrame(0);
            setPosition(getFramePosition(0));
        }, [animation]);

        useEffect(() => {
            if (!isPlaying) return;

            const intervalId = setInterval(() => {
                setCurrentFrame(prev => {
                    const nextFrame = (prev + 1) % SPRITE_CONFIG.animations[currentAnimation].frames;
                    setPosition(getFramePosition(nextFrame));
                    return nextFrame;
                });
            }, frameRate);

            return () => clearInterval(intervalId);
        }, [isPlaying, frameRate, currentAnimation]);

        const nextFrame = () => {
            const nextFrameIndex = (currentFrame + 1) % SPRITE_CONFIG.animations[currentAnimation].frames;
            setCurrentFrame(nextFrameIndex);
            setPosition(getFramePosition(nextFrameIndex));
        };

        const previousFrame = () => {
            const prevFrameIndex = currentFrame === 0
                ? SPRITE_CONFIG.animations[currentAnimation].frames - 1
                : currentFrame - 1;
            setCurrentFrame(prevFrameIndex);
            setPosition(getFramePosition(prevFrameIndex));
        };

        const handleAnimationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newAnimation = e.target.value as SoldierAnimation;
            setCurrentAnimation(newAnimation);
            setCurrentFrame(0);
            setPosition(getFramePosition(0));
        };

        return (
            <>
                <SpriteContainer>
                    <SpriteImage
                        src={spriteSheet}
                        style={{
                            transform: `translate(${isPlayerCharacter ? (-position.x) : position.x + frameWidth * scale}px, ${-position.y}px) scale(${scale})  translate(-25px, -25px) ${isPlayerCharacter ? '' : 'scaleX(-1)'}`
                        }}
                        alt={`${currentAnimation} animation`}
                    />

                </SpriteContainer>
                {showDebugControls && (
                    <div style={{
                        position: 'fixed',
                        top: 10,
                        left: 10,
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '5px'
                    }}>
                        <div>
                            <div>Animation:</div>
                            <select
                                value={currentAnimation}
                                onChange={handleAnimationChange}
                                style={{
                                    marginBottom: '5px',
                                    backgroundColor: '#444',
                                    color: 'white',
                                    border: '1px solid #666',
                                    padding: '2px',
                                    width: '100%'
                                }}
                            >
                                {Object.values(SoldierAnimation).map((anim) => (
                                    <option key={anim} value={anim}>
                                        {anim}
                                    </option>
                                ))}
                            </select>
                            <div>Frame: {currentFrame + 1} / {SPRITE_CONFIG.animations[currentAnimation].frames}</div>
                            <div>Sprite Position:</div>
                            <div style={{
                                border: '1px solid white',
                                padding: '10px',
                                marginTop: '5px',
                                textAlign: 'center'
                            }}>
                                <div>Position: ({position.x}, {position.y})</div>
                                <div>Row: {SPRITE_CONFIG.animations[currentAnimation].row}</div>
                                <div>Frame: {currentFrame}</div>
                            </div>
                        </div>
                        <div style={{marginTop: '10px', display: 'flex', gap: '5px'}}>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                style={{
                                    backgroundColor: isPlaying ? '#f44336' : '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '3px'
                                }}
                            >
                                {isPlaying ? 'Pause' : 'Play'}
                            </button>
                            <button
                                onClick={previousFrame}
                                disabled={isPlaying}
                                style={{
                                    backgroundColor: isPlaying ? '#666' : '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '3px'
                                }}
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextFrame}
                                disabled={isPlaying}
                                style={{
                                    backgroundColor: isPlaying ? '#666' : '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '3px'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

}