<template>
  <div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="panels">
      <AddNodeForm @add="add" />
      <NodeActions
        :selected-node="selectedNode"
        @edit="edit"
        @delete="remove"
        @deselect="deselect"
      />
    </div>

    <TreeView
      v-if="nodes.length"
      :nodes="nodes"
      :selected-node="selectedNode"
      @node-click="select"
    />
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useNodes } from "@/composables/useNodes";
import TreeView from "@/components/TreeView.vue";
import AddNodeForm from "@/components/AddNodeForm.vue";
import NodeActions from "@/components/NodeActions.vue";

export default {
  name: "TreePage",
  components: { TreeView, AddNodeForm, NodeActions },
  setup() {
    const {
      nodes,
      selectedNode,
      loading,
      error,
      load,
      add,
      edit,
      remove,
      select,
      deselect,
    } = useNodes();

    onMounted(load);

    return {
      nodes,
      selectedNode,
      loading,
      error,
      add,
      edit,
      remove,
      select,
      deselect,
    };
  },
};
</script>
