import { RefObject, useState, useEffect, Ref, useRef } from "react";

export interface DropdownMenuControl<T> {
  selectedItem: T | undefined;
  itemRef(item: T): Ref<HTMLElement | null>;
}

export default function useDropdownMenuControl<T extends object>(
  input: string,
  items: T[],
  inputRef: RefObject<HTMLInputElement | null>,
  onClose: () => void
): DropdownMenuControl<T> {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const itemRefMapRef = useRef(new WeakMap<T, RefObject<HTMLElement | null>>());

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowUp": {
          e.preventDefault();
          const newSelectedIndex = selectedIndex - 1;

          if (items.length === 0) {
            setSelectedIndex(-1);
          } else if (newSelectedIndex === -1) {
            setSelectedIndex(items.length - 1);
          } else {
            setSelectedIndex(newSelectedIndex);
          }

          break;
        }

        case "ArrowDown": {
          e.preventDefault();
          const newSelectedIndex = selectedIndex + 1;

          if (items.length === 0) {
            setSelectedIndex(-1);
          } else if (newSelectedIndex === items.length) {
            setSelectedIndex(0);
          } else {
            setSelectedIndex(newSelectedIndex);
          }

          break;
        }

        case "Enter": {
          e.preventDefault();
          const itemRef = itemRefMapRef.current.get(items[selectedIndex]);

          if (itemRef != null && itemRef.current != null) {
            itemRef.current.click();
            onClose();
          }

          break;
        }
      }
    }

    if (inputRef.current != null) {
      const input = inputRef.current;

      input.addEventListener("keydown", onKeyDown);
      return () => {
        input.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [inputRef, items, selectedIndex, onClose]);

  useEffect(() => {
    setSelectedIndex(items.length > 0 ? 0 : -1);
  }, [input, items]);

  return {
    selectedItem: items[selectedIndex],
    itemRef(item) {
      const map = itemRefMapRef.current;
      if (!map.has(item)) {
        map.set(item, {
          current: null
        });
      }
      return map.get(item)!;
    }
  };
}
