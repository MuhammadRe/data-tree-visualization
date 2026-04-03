import { storeToRefs } from "pinia";
import { useNodeStore } from "@/stores/nodeStore";

export function useNodes() {
  const store = useNodeStore();
  const { nodes, selectedNode, loading, error } = storeToRefs(store);

  return {
    nodes,
    selectedNode,
    loading,
    error,
    load: store.load,
    add: store.add,
    edit: store.edit,
    remove: store.remove,
    select: store.select,
    deselect: store.deselect,
  };
}
