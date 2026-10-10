import { create } from 'zustand';

interface MediaItem {
  id: string;
  title: string;
  posterUrl: string;
  mediaType: string;
}

interface StoreState {
  myList: MediaItem[];
  toggleMyList: (item: MediaItem) => void;
  isInMyList: (id: string) => boolean;
}

export const useStore = create<StoreState>((set, get) => ({
  myList: [],
  toggleMyList: (item) => {
    const { myList } = get();
    const exists = myList.find((i) => i.id === item.id);
    if (exists) {
      set({ myList: myList.filter((i) => i.id !== item.id) });
    } else {
      set({ myList: [item, ...myList] });
    }
  },
  isInMyList: (id) => {
    return !!get().myList.find((i) => i.id === id);
  }
}));
