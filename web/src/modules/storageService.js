const STORAGE_KEY = 'mlbbTournament';

export const saveTournament = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
    return true;
  } catch (e) {
    console.warn('Could not save state', e);
    return false;
  }
};

export const loadTournament = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.warn('Could not load state', e);
    return undefined;
  }
};

export const clearTournament = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.warn('Could not clear state', e);
    return false;
  }
};