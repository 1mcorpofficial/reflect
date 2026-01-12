/**
 * Apple Health-inspired Activity Rings Component (Light Theme)
 * Three concentric rings showing progress toward goals
 */
import clsx from "clsx";

export function ActivityRings({ 
  completed = 0,  // 0-100, outer ring (green)
  progress = 0,   // 0-100, middle ring (blue)
  goal = 0,       // 0-100, inner ring (amber)
  size = 120,
  strokeWidth = 8,
  className
}) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate ring positions (concentric)
  const outerRadius = radius;
  const middleRadius = radius - strokeWidth * 1.2;
  const innerRadius = radius - strokeWidth * 2.4;
  
  const outerCircumference = 2 * Math.PI * outerRadius;
  const middleCircumference = 2 * Math.PI * middleRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;
  
  // Calculate stroke dasharray and offset
  const getDashArray = (circ) => circ;
  const getDashOffset = (circ, percentage) => circ - (percentage / 100) * circ;
  
  return (
    <div className={clsx("inline-flex items-center justify-center relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background rings (light gray) */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#e8e8ed"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        <circle
          cx={center}
          cy={center}
          r={middleRadius}
          fill="none"
          stroke="#e8e8ed"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#e8e8ed"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        
        {/* Progress rings */}
        {/* Outer ring - Completed (Green) */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#34c759"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={getDashArray(outerCircumference)}
          strokeDashoffset={getDashOffset(outerCircumference, completed)}
          className="transition-all duration-500 ease-out"
        />
        
        {/* Middle ring - Progress (Blue) */}
        <circle
          cx={center}
          cy={center}
          r={middleRadius}
          fill="none"
          stroke="#007aff"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={getDashArray(middleCircumference)}
          strokeDashoffset={getDashOffset(middleCircumference, progress)}
          className="transition-all duration-500 ease-out"
        />
        
        {/* Inner ring - Goal (Amber) */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="#ff9500"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={getDashArray(innerCircumference)}
          strokeDashoffset={getDashOffset(innerCircumference, goal)}
          className="transition-all duration-500 ease-out"
        />
      </svg>
    </div>
  );
}

/**
 * Single Activity Ring (simpler version for calendar views)
 */
export function SingleActivityRing({
  percentage = 0,
  color = "#34c759",
  size = 40,
  strokeWidth = 4,
  className
}) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className={clsx("inline-flex items-center justify-center relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e8e8ed"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-300 ease-out"
        />
      </svg>
    </div>
  );
}

