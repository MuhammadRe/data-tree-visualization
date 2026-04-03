import { defineStore } from "pinia";
import {
  fetchNodes,
  createNode,
  updateNode,
  deleteNode,
} from "@/services/nodeService";

export const useNodeStore = defineStore("nodes", {
  state: () => ({
    nodes: [],
    selectedNode: null,
    loading: false,
    error: null,
  }),

  actions: {
    async load() {
      this.loading = true;
      this.error = null;
      try {
        this.nodes = await fetchNodes();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async add(node) {
      if (!node.name) {
        this.error = "Name is required.";
        return;
      }
      if (!node.parent && this.nodes.some((n) => !n.parent)) {
        this.error =
          "A root node already exists. Please specify a parent node.";
        return;
      }
      this.error = null;
      try {
        await createNode(node);
        await this.load();
      } catch (err) {
        this.error = err.message;
      }
    },

    async edit(node) {
      try {
        await updateNode(node._id, {
          name: node.name,
          description: node.description,
        });
        this.selectedNode = null;
        await this.load();
      } catch (err) {
        this.error = err.message;
      }
    },

    async remove(id) {
      try {
        await deleteNode(id);
        this.selectedNode = null;
        await this.load();
      } catch (err) {
        this.error = err.message;
      }
    },

    select(node) {
      this.selectedNode = node;
    },

    deselect() {
      this.selectedNode = null;
    },
  },
});
