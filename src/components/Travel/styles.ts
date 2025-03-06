import styled from 'styled-components';

export const TravelLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
  background: var(--medium-wood);
  background-image: repeating-linear-gradient(
    120deg,
    rgba(0,0,0,0.1) 0px,
    transparent 2px,
    rgba(0,0,0,0.1) 4px
  );
  box-shadow: inset 0 0 100px rgba(0,0,0,0.3);
`;

export const MainContent = styled.div`
  padding: 24px;
  background: var(--light-wood);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 30px,
      rgba(0,0,0,0.03) 30px,
      rgba(0,0,0,0.03) 31px
    );
    pointer-events: none;
    border-radius: 8px;
  }
`;

export const MapContainer = styled.div`
  position: relative;
  height: 600px;
  background: var(--parchment);
  border-radius: 8px;
  padding: 16px;
  border: 2px solid var(--dark-wood);
  margin-top: 20px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
  overflow: hidden;
  background-image: 
    repeating-linear-gradient(
      45deg,
      rgba(139, 69, 19, 0.05) 0px,
      rgba(139, 69, 19, 0.05) 1px,
      transparent 1px,
      transparent 2px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(139, 69, 19, 0.05) 0px,
      rgba(139, 69, 19, 0.05) 1px,
      transparent 1px,
      transparent 2px
    );
`;

export const MapSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

export const LocationNode = styled.button<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--dark-wood);
  border: 3px solid var(--medium-wood);
  color: var(--parchment);
  font-size: 1.5em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  z-index: 2;

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    background: var(--medium-wood);
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
  }
`;

export const LocationLabel = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}%;
  top: ${props => props.y + 8}%;
  transform: translateX(-50%);
  color: var(--dark-wood);
  font-size: 0.8em;
  font-weight: bold;
  text-align: center;
  text-shadow: 1px 1px 0 var(--parchment);
  pointer-events: none;
  z-index: 1;
`;

export const LocationsSidebar = styled.div`
  background: var(--light-wood);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
`;

export const LocationsHeader = styled.h2`
  color: var(--dark-text);
  margin: 0;
  font-size: 1.2em;
`;

export const ContinueButton = styled.button`
  /* Add your continue button styles here */
`;