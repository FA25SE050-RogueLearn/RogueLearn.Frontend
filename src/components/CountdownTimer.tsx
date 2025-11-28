"use client";

import { useState, useEffect } from 'react';
import Counter from './Counter';

interface CountdownTimerProps {
  endDate: string;
  fontSize?: number;
  padding?: number;
  gap?: number;
  borderRadius?: number;
  horizontalPadding?: number;
  textColor?: string;
  fontWeight?: React.CSSProperties['fontWeight'];
  containerStyle?: React.CSSProperties;
  counterStyle?: React.CSSProperties;
  digitStyle?: React.CSSProperties;
  gradientHeight?: number;
  gradientFrom?: string;
  gradientTo?: string;
  topGradientStyle?: React.CSSProperties;
  bottomGradientStyle?: React.CSSProperties;
  showLabels?: boolean;
  labelStyle?: React.CSSProperties;
  onComplete?: () => void;
}

const calculateTimeRemaining = (endDate: string): number => {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const secondsLeft = Math.floor((end - now) / 1000);
  return secondsLeft > 0 ? secondsLeft : 0;
};

export default function CountdownTimer({
  endDate,
  fontSize = 40,
  padding = 0,
  gap = 4,
  borderRadius = 8,
  horizontalPadding = 8,
  textColor = 'white',
  fontWeight = 'bold',
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 16,
  gradientFrom = 'rgba(18, 8, 6, 0.8)',
  gradientTo = 'transparent',
  topGradientStyle,
  bottomGradientStyle,
  showLabels = true,
  labelStyle,
  onComplete,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => calculateTimeRemaining(endDate));
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(endDate);
      setSecondsLeft(remaining);

      // Call onComplete callback when timer reaches 0
      if (remaining <= 0 && !hasCompleted && onComplete) {
        setHasCompleted(true);
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, hasCompleted, onComplete]);

  if (secondsLeft <= 0) return null;

  // Calculate hours, minutes, seconds
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const defaultLabelStyle: React.CSSProperties = {
    fontSize: fontSize * 0.3,
    textAlign: 'center',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    opacity: 0.7,
    fontWeight: 600,
  };

  const unitContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: gap * 2,
  };

  const separatorStyle: React.CSSProperties = {
    fontSize: fontSize,
    fontWeight: fontWeight,
    color: textColor,
    opacity: 0.8,
    lineHeight: 1,
    textShadow: '0 0 10px rgba(245, 193, 108, 0.5)',
  };

  return (
    <div style={wrapperStyle}>
      {/* Hours */}
      {hours > 0 && (
        <>
          <div style={unitContainerStyle}>
            <Counter
              value={hours}
              fontSize={fontSize}
              padding={padding}
              places={hours >= 10 ? [10, 1] : [1]}
              gap={gap}
              borderRadius={borderRadius}
              horizontalPadding={horizontalPadding}
              textColor={textColor}
              fontWeight={fontWeight}
              containerStyle={containerStyle}
              counterStyle={counterStyle}
              digitStyle={digitStyle}
              gradientHeight={gradientHeight}
              gradientFrom={gradientFrom}
              gradientTo={gradientTo}
              topGradientStyle={topGradientStyle}
              bottomGradientStyle={bottomGradientStyle}
            />
            {showLabels && (
              <div style={{ ...defaultLabelStyle, ...labelStyle }}>
                {hours === 1 ? 'Hour' : 'Hours'}
              </div>
            )}
          </div>
          <div style={separatorStyle}>:</div>
        </>
      )}

      {/* Minutes */}
      <div style={unitContainerStyle}>
        <Counter
          value={minutes}
          fontSize={fontSize}
          padding={padding}
          places={minutes >= 10 || hours > 0 ? [10, 1] : [1]}
          gap={gap}
          borderRadius={borderRadius}
          horizontalPadding={horizontalPadding}
          textColor={textColor}
          fontWeight={fontWeight}
          containerStyle={containerStyle}
          counterStyle={counterStyle}
          digitStyle={digitStyle}
          gradientHeight={gradientHeight}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          topGradientStyle={topGradientStyle}
          bottomGradientStyle={bottomGradientStyle}
        />
        {showLabels && (
          <div style={{ ...defaultLabelStyle, ...labelStyle }}>
            {minutes === 1 ? 'Minute' : 'Minutes'}
          </div>
        )}
      </div>

      <div style={separatorStyle}>:</div>

      {/* Seconds */}
      <div style={unitContainerStyle}>
        <Counter
          value={seconds}
          fontSize={fontSize}
          padding={padding}
          places={[10, 1]}
          gap={gap}
          borderRadius={borderRadius}
          horizontalPadding={horizontalPadding}
          textColor={textColor}
          fontWeight={fontWeight}
          containerStyle={containerStyle}
          counterStyle={counterStyle}
          digitStyle={digitStyle}
          gradientHeight={gradientHeight}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          topGradientStyle={topGradientStyle}
          bottomGradientStyle={bottomGradientStyle}
        />
        {showLabels && (
          <div style={{ ...defaultLabelStyle, ...labelStyle }}>
            {seconds === 1 ? 'Second' : 'Seconds'}
          </div>
        )}
      </div>
    </div>
  );
}
