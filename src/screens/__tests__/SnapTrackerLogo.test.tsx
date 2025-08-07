import React from 'react';
import { render } from '@testing-library/react-native';
import SnaptrackerLogo from '../../icons/SnapTrackerLogoNew';

describe('SnaptrackerLogo', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<SnaptrackerLogo width={100} height={40} />);
    // You can add a testID to your SVG component for more robust tests
    // For now, just check that it renders
    expect(getByTestId).toBeDefined();
  });
});