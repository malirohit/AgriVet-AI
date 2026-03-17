import { Appointment, Query } from '@/types';
import { MOCK_APPOINTMENTS, MOCK_QUERIES } from '@/data/mockData';
import { useState } from 'react';

// Simple in-memory store with React hook
let appointmentsStore = [...MOCK_APPOINTMENTS];
let queriesStore = [...MOCK_QUERIES];

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(appointmentsStore);
  const [queries, setQueries] = useState<Query[]>(queriesStore);

  const addAppointment = (apt: Omit<Appointment, 'id'>) => {
    const newApt = { ...apt, id: `apt-${Date.now()}` } as Appointment;
    appointmentsStore = [...appointmentsStore, newApt];
    setAppointments(appointmentsStore);
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    appointmentsStore = appointmentsStore.map(a => a.id === id ? { ...a, ...updates } : a);
    setAppointments(appointmentsStore);
  };

  const addQuery = (q: Omit<Query, 'id' | 'timestamp'>) => {
    const newQ = { ...q, id: `q-${Date.now()}`, timestamp: new Date().toISOString() } as Query;
    queriesStore = [...queriesStore, newQ];
    setQueries(queriesStore);
  };

  const getQueriesForAppointment = (aptId: string) => queries.filter(q => q.appointmentId === aptId);

  return { appointments, addAppointment, updateAppointment, queries, addQuery, getQueriesForAppointment, refresh: () => { setAppointments([...appointmentsStore]); setQueries([...queriesStore]); } };
}
