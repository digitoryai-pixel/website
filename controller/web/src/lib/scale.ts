'use client';
// Bluetooth scale via the standard BLE Weight Scale service (0x181D / 0x2A9D).
// A reading is "locked" once it has been stable for a moment, so what is saved
// is what the scale showed, not what someone typed.
import { useCallback, useRef, useState } from 'react';

type BtChar = { startNotifications(): Promise<unknown>; addEventListener(t: string, f: (e: Event) => void): void; value?: DataView };
type BtNav = { bluetooth?: { requestDevice(o: unknown): Promise<{ name?: string; gatt?: { connect(): Promise<{ getPrimaryService(s: string): Promise<{ getCharacteristic(c: string): Promise<BtChar> }> }> } }> } };

export function parseWeight(v: DataView): number {
  const flags = v.getUint8(0);
  const imperial = (flags & 0x01) === 1;
  const raw = v.getUint16(1, true);
  return imperial ? raw * 0.01 * 0.453592 : raw * 0.005; // kg
}

export function useScale() {
  const [connected, setConnected] = useState<string | null>(null);
  const [kg, setKg] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const last = useRef<{ v: number; t: number } | null>(null);
  const supported = typeof navigator !== 'undefined' && !!(navigator as unknown as BtNav).bluetooth;

  const connect = useCallback(async () => {
    setError(null);
    try {
      const bt = (navigator as unknown as BtNav).bluetooth!;
      const device = await bt.requestDevice({ filters: [{ services: ['weight_scale'] }] });
      const server = await device.gatt!.connect();
      const svc = await server.getPrimaryService('weight_scale');
      const ch = await svc.getCharacteristic('weight_measurement');
      ch.addEventListener('characteristicvaluechanged', (e) => {
        const value = (e.target as unknown as BtChar).value!;
        const w = Math.round(parseWeight(value) * 1000) / 1000;
        const now = Date.now();
        if (last.current && Math.abs(last.current.v - w) < 0.005) setLocked(now - last.current.t > 1200);
        else {
          last.current = { v: w, t: now };
          setLocked(false);
        }
        setKg(w);
      });
      await ch.startNotifications();
      setConnected(device.name ?? 'Scale');
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  return { supported, connected, kg, locked, error, connect, reset: () => { setKg(null); setLocked(false); last.current = null; } };
}
