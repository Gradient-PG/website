'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, RotateCcw } from 'lucide-react';
import { Button } from './button';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

function SortableItem({ id, children, className = '' }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 ${className} ${isDragging ? 'opacity-50' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

interface SortableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => Promise<void>;
  children: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;
  className?: string;
}

export function SortableList<T>({
  items,
  onReorder,
  children,
  getItemId,
  className = '',
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [localItems, setLocalItems] = React.useState<T[]>(items);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const originalItemsRef = useRef<T[]>(items);

  // Update local items when props change
  useEffect(() => {
    setLocalItems(items);
    originalItemsRef.current = items;
    setHasUnsavedChanges(false);
  }, [items]);

  const saveChanges = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;

    setIsSaving(true);
    try {
      await onReorder(localItems);
      originalItemsRef.current = localItems;
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save order changes:', error);
      // Revert to original items on error
      setLocalItems(originalItemsRef.current);
      setHasUnsavedChanges(false);
      throw error; // Re-throw to let parent handle error display
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, isSaving, onReorder, localItems]);

  const discardChanges = useCallback(() => {
    setLocalItems(originalItemsRef.current);
    setHasUnsavedChanges(false);
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex(item => getItemId(item) === active.id);
      const newIndex = localItems.findIndex(item => getItemId(item) === over.id);

      const newItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newItems);
      setHasUnsavedChanges(true);
    }
  }

  return (
    <div className="relative">
      {/* Save/Discard Controls */}
      {hasUnsavedChanges && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-800">
                You have unsaved changes to the order
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={discardChanges}
                disabled={isSaving}
                className="text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={saveChanges}
                disabled={isSaving}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localItems.map(getItemId)} strategy={verticalListSortingStrategy}>
          <div className={className}>
            {localItems.map((item, index) => (
              <SortableItem
                key={getItemId(item)}
                id={getItemId(item)}
                className="mb-2"
              >
                {children(item, index)}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
} 