// Handles localStorage operations
const STORAGE_KEY = 'todo_app_data';

// Merges items based on modified timestamp
function mergeItems(localItems, sourceItems) {
  // Create a map of local items by ID for easy lookup
  const localItemsMap = new Map(
    localItems.map((item) => [item.id, item]),
  );

  const result = [];

  // Check each source item
  sourceItems.forEach((sourceItem) => {
    const localItem = localItemsMap.get(sourceItem.id);

    // If item doesn't exist locally, add it
    if (!localItem) {
      result.push(sourceItem);
      return;
    }

    // If local item has been modified more recently, keep it
    if (localItem.modified > sourceItem.modified) {
      result.push(localItem);
      // Remove from map to mark as processed
      localItemsMap.delete(localItem.id);
    } else {
      // Otherwise take the source item
      result.push(sourceItem);
      localItemsMap.delete(localItem.id);
    }
  });

  // Add any remaining local items (these are items created locally)
  localItemsMap.forEach((item) => {
    result.push(item);
  });

  return result;
}

// Saves data to localStorage
export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

// Loads data from localStorage
export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

// Syncs data from source with localStorage
export async function syncWithLocalStorage(sourceData) {
  // Get current data from localStorage
  const localData = loadFromLocalStorage();

  // If no local data exists, simply save source data and return it
  if (!localData) {
    saveToLocalStorage(sourceData);
    return sourceData;
  }

  // Merge items based on modified timestamp
  const mergedItems = mergeItems(localData.items, sourceData.items);

  // Create updated data with merged items and original categories
  const mergedData = {
    items: mergedItems,
    categories: sourceData.categories,
  };

  // Save merged data back to localStorage
  saveToLocalStorage(mergedData);

  return mergedData;
}

// Fetches initial data from data.json if needed
export async function loadInitialData() {
  try {
    // First try to load from localStorage
    const localData = loadFromLocalStorage();

    if (localData) {
      console.info('Data loaded from localStorage');
      return localData;
    }

    // If no local data, fetch from data.json
    console.info('Fetching data from data.json');
    const response = await fetch('data/data.json');

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const sourceData = await response.json();

    // Save to localStorage for future use
    saveToLocalStorage(sourceData);

    return sourceData;
  } catch (error) {
    console.error('Error loading initial data:', error);
    throw error;
  }
}
