<template>
  <div class="form-panel">
    <h2>Add Node</h2>
    <label>Name</label>
    <input v-model="form.name" placeholder="e.g. E" />
    <label>Description</label>
    <input v-model="form.description" placeholder="e.g. This is node E" />
    <label>Parent</label>
    <input
      v-model="form.parent"
      placeholder="Leave empty only if no root exists"
    />
    <button class="btn-primary" @click="submit">Add Node</button>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "AddNodeForm",
  emits: ["add"],
  setup(_, { emit }) {
    const form = ref({ name: "", description: "", parent: "" });

    function submit() {
      emit("add", { ...form.value });
      form.value = { name: "", description: "", parent: "" };
    }

    return { form, submit };
  },
};
</script>

<style scoped>
@import "@/styles/AddNodeForm.css";
</style>
