import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import mockEstimates from '../../../../../test/data/mock-estimates.json';
import mockState from '../../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../../test/lib/render-helpers';
import configureStore from '../../../../store/store';
import { GasFeeContextProvider } from '../../../../contexts/gasFee';

import { GAS_ESTIMATE_TYPES } from '../../../../../shared/constants/gas';
import BasefeeInput from './basefee-input';

jest.mock('../../../../store/actions', () => ({
  disconnectGasFeeEstimatePoller: jest.fn(),
  getGasFeeEstimatesAndStartPolling: jest
    .fn()
    .mockImplementation(() => Promise.resolve()),
  addPollingTokenToAppState: jest.fn(),
}));

const render = (txProps) => {
  const store = configureStore({
    metamask: {
      ...mockState.metamask,
      accounts: {
        [mockState.metamask.selectedAddress]: {
          address: mockState.metamask.selectedAddress,
          balance: '0x1F4',
        },
      },
      advancedGasFee: { maxBaseFee: 2 },
      featureFlags: { advancedInlineGas: true },
      gasFeeEstimates:
        mockEstimates[GAS_ESTIMATE_TYPES.FEE_MARKET].gasFeeEstimates,
    },
  });

  return renderWithProvider(
    <GasFeeContextProvider
      transaction={{
        txParams: {
          userFeeLevel: 'high',
        },
        ...txProps,
      }}
    >
      <BasefeeInput />
    </GasFeeContextProvider>,
    store,
  );
};

describe('BasefeeInput', () => {
  it('should renders advancedGasFee.baseFee value if current estimate used is not custom', () => {
    render();
    expect(document.getElementsByTagName('input')[0]).toHaveValue(2);
  });

  it('should renders priorityfee values from transaction if current estimate used is custom', () => {
    render({
      txParams: {
        maxFeePerGas: '0x174876E800',
        maxPriorityFeePerGas: '0x174876E800',
      },
    });
    expect(document.getElementsByTagName('input')[0]).toHaveValue(2);
  });

  it('should show GWEI value in input when Edit in GWEI link is clicked', () => {
    render({
      txParams: {
        maxFeePerGas: '0x174876E800',
        maxPriorityFeePerGas: '0x174876E800',
      },
    });
    fireEvent.click(screen.queryByText('Edit in GWEI'));
    expect(document.getElementsByTagName('input')[0]).toHaveValue(100);
  });

  it('should show current value of estimatedBaseFee in subtext', () => {
    render({
      txParams: {
        maxFeePerGas: '0x174876E800',
        maxPriorityFeePerGas: '0x174876E800',
      },
    });
    expect(screen.queryByText('50')).toBeInTheDocument();
  });
});