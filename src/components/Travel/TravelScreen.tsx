import React, {useState} from 'react';
import {TravelScreenProps} from './TravelScreenProps';
import {locations} from './data/locations';
import {createPath} from './utils';
import {
    ContinueButton,
    LocationLabel,
    LocationNode,
    LocationsHeader,
    LocationsSidebar,
    MainContent,
    MapContainer,
    MapSVG,
    TravelLayout
} from './styles';
import '../../styles/PreparationScreenStyles.css';
import TrainingGroundModal from "./modals/TrainingModal";
import {TravelLocation} from '../../types/TravelLocation';


export const TravelScreen: React.FC<TravelScreenProps> = ({
                                                              onContinueToBattle
                                                          }) => {
    const [showTraining, setShowTraining] = useState(false);

    const handleLocationClick = (location: TravelLocation) => {
        if (location.name === 'Training Ground') {
            setShowTraining(true);
        }
    };

    return (
        <TravelLayout>
            <MainContent>
                {/*<PlayerSection>*/}
                {/*  <Title>{player.name}'s Journey</Title>*/}
                {/*  <CharacterSprite>*/}
                {/*    <SoldierSprite*/}
                {/*        animation={SoldierAnimation.IDLE}*/}
                {/*        showDebugControls={true}*/}
                {/*        scale={2}*/}
                {/*        frameHeight={100}*/}
                {/*        frameWidth={100}*/}
                {/*    />*/}
                {/*  </CharacterSprite>*/}
                {/*</PlayerSection>*/}

                <MapContainer>
                    <MapSVG>
                        {locations.slice(1).map((location, index) => (
                            <path
                                key={`path-${index}`}
                                d={createPath(
                                    locations[0].x,
                                    locations[0].y,
                                    location.x,
                                    location.y
                                )}
                                stroke="var(--dark-wood)"
                                strokeWidth="3"
                                fill="none"
                                opacity="0.6"
                                strokeDasharray="5,5"
                            />
                        ))}
                    </MapSVG>

                    {locations.map((location, index) => (
                        <React.Fragment key={index}>
                            <LocationNode
                                x={location.x}
                                y={location.y}
                                title={location.name}
                                onClick={() => handleLocationClick(location)}

                            >
                                {location.icon}
                            </LocationNode>
                            <LocationLabel x={location.x} y={location.y}>
                                {location.name}
                            </LocationLabel>
                        </React.Fragment>
                    ))}
                </MapContainer>
            </MainContent>

            {showTraining && (
                <TrainingGroundModal
                    onClose={() => setShowTraining(false)}
                />
            )}

            <LocationsSidebar>
                <LocationsHeader>Location Details</LocationsHeader>
                <div style={{
                    padding: '16px',
                    color: 'var(--dark-text)',
                    background: 'var(--parchment)',
                    borderRadius: '4px',
                    border: '2px solid var(--dark-wood)',
                    marginTop: '8px'
                }}>
                    Select a location to view details
                </div>
            </LocationsSidebar>

            <ContinueButton onClick={() => onContinueToBattle()}>
                Continue to Battle
            </ContinueButton>
        </TravelLayout>
    );
};