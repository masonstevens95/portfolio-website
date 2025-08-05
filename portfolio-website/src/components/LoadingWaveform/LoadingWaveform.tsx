import { waveform } from "ldrs";

export const LoadingWaveform = () => {
  waveform.register();

  return (
    <l-waveform size="35" stroke="3.5" speed="2" color="black"></l-waveform>
  );
};
