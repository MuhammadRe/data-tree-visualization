<template>
  <div>
    <!-- Selected Node Panel -->
    <div v-if="selectedNode && !editing" class="form-panel">
      <h2>Selected: {{ selectedNode.name }}</h2>
      <p class="description">{{ selectedNode.description }}</p>
      <div class="btn-row">
        <button class="btn-primary" @click="startEdit">Edit</button>
        <button class="btn-danger" @click="showConfirm = true">Delete</button>
        <button class="btn-secondary" @click="$emit('deselect')">Close</button>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-if="editing" class="form-panel">
      <h2>Edit Node</h2>
      <label>Name</label>
      <input v-model="editForm.name" placeholder="Name" />
      <label>Description</label>
      <input v-model="editForm.description" placeholder="Description" />
      <div class="btn-row">
        <button class="btn-primary" @click="submitEdit">Save</button>
        <button class="btn-secondary" @click="editing = false">Cancel</button>
      </div>
    </div>

    <!-- Delete Confirmation Overlay -->
    <div v-if="showConfirm" class="overlay">
      <div class="confirm-dialog">
        <h3>Delete "{{ selectedNode.name }}"?</h3>
        <p>This action cannot be undone.</p>
        <div class="btn-row">
          <button class="btn-danger" @click="submitDelete">Delete</button>
          <button class="btn-secondary" @click="showConfirm = false">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "NodeActions",
  props: {
    selectedNode: {
      type: Object,
      default: null,
    },
  },
  emits: ["edit", "delete", "deselect"],
  setup(props, { emit }) {
    const editing = ref(false);
    const showConfirm = ref(false);
    const editForm = ref({ name: "", description: "" });

    watch(
      () => props.selectedNode,
      () => {
        editing.value = false;
        showConfirm.value = false;
      }
    );

    function startEdit() {
      editForm.value = {
        name: props.selectedNode.name,
        description: props.selectedNode.description,
      };
      editing.value = true;
    }

    function submitEdit() {
      emit("edit", { _id: props.selectedNode._id, ...editForm.value });
      editing.value = false;
    }

    function submitDelete() {
      emit("delete", props.selectedNode._id);
      showConfirm.value = false;
    }

    return {
      editing,
      showConfirm,
      editForm,
      startEdit,
      submitEdit,
      submitDelete,
    };
  },
};
</script>

<style scoped>
@import "@/styles/NodeActions.css";
</style>
