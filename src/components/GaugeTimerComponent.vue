<template>
  <div class="gauge-timer">
    <div class="gauge-container" :class="{ 'broken-glass': timeRemaining <= maxTime / 2 }">
      <div 
        class="gauge-dial"
        :style="dialStyle"
      >
        <svg width="100%" height="100%" viewBox="0 0 6 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <!-- Needle stem -->
          <rect x="2" y="0" width="2" height="45" fill="#b30000" />
          
          <!-- Needle point -->
          <polygon points="0,45 3,50 6,45" fill="#b30000" />
          
          <!-- Circle at the base -->
          <circle cx="3" cy="45" r="3" fill="#8a0000" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  timeRemaining: {
    type: Number,
    required: true
  },
  maxTime: {
    type: Number,
    default: 30
  }
});

// Adjust the angle calculation to start from the left (green section)
const dialStyle = computed(() => {
  // Calculate angle: Start from -90 degrees (left) to rotate it properly
  const percentage = props.timeRemaining / props.maxTime;
  const angle = -90 + (1 - percentage) * 180;

  // Calculate the left position: End at 37% when timeRemaining is 0
  const leftPosition = 45 - (1 - percentage) * (45 - 37);

  return {
    transform: `rotate(${angle}deg)`,
    left: `${leftPosition}%`
  };
});
</script>

<style scoped>
.gauge-timer {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.gauge-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.gauge-dial {
  position: absolute;
  top: 0;
  left: 45%;
  width: 6px;
  height: 50px;
  transform-origin: bottom center;
  transform: translateX(-3px);
  transition: all 0.3s ease;
}

.gauge-container:before {
    content: "";
    height: 100%;
    width: 100%;
    position: absolute;
    background-image: url('/broken-glass.png');
    background-size: 100% 100%;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
}

.gauge-container.broken-glass:before {
    opacity: 1;
}
</style>
