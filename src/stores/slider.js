import { defineStore } from 'pinia'

import slide2 from '@/assets/slider-2.jpg'
import slide3 from '@/assets/slider-3.jpg'
import slide4 from '@/assets/slider-4.jpg'
import slide5 from '@/assets/slider-5.jpg'


export const useSliderStore = defineStore('slider', () => {
  const slides = [slide2, slide3, slide4, slide5]
  return { slides }
})