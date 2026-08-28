// Regression: Hero + FeaturesBento must render without crash
import { render } from '@testing-library/react';
import Hero from '../Hero';
import FeaturesBento from '../FeaturesBento';

describe('design smoke', () => {
  it('Hero renders', () => { render(<Hero />); });
  it('FeaturesBento renders', () => { render(<FeaturesBento />); });
});
