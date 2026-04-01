<template>
  <div class="app">
    <h1>Data Tree Visualization</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="panels">
      <!-- Add Node Form -->
      <div class="form-panel">
        <h2>Add Node</h2>
        <label>Name</label>
        <input v-model="newNode.name" placeholder="e.g. E" />
        <label>Description</label>
        <input
          v-model="newNode.description"
          placeholder="e.g. This is node E"
        />
        <label>Parent</label>
        <input
          v-model="newNode.parent"
          placeholder="Leave empty only if no root exists"
        />
        <button class="btn-primary" @click="addNode">Add Node</button>
      </div>

      <!-- Selected Node Panel -->
      <div v-if="selectedNode && !editNode" class="form-panel selected-panel">
        <h2>Selected: {{ selectedNode.name }}</h2>
        <p class="description">{{ selectedNode.description }}</p>
        <div class="btn-row">
          <button class="btn-primary" @click="startEdit">Edit</button>
          <button class="btn-danger" @click="confirmDelete = selectedNode">
            Delete
          </button>
          <button class="btn-secondary" @click="selectedNode = null">
            Close
          </button>
        </div>
      </div>

      <!-- Edit Node Form -->
      <div v-if="editNode" class="form-panel">
        <h2>Edit Node</h2>
        <label>Name</label>
        <input v-model="editNode.name" placeholder="Name" />
        <label>Description</label>
        <input v-model="editNode.description" placeholder="Description" />
        <div class="btn-row">
          <button class="btn-primary" @click="saveEdit">Save</button>
          <button class="btn-secondary" @click="editNode = null">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="confirmDelete" class="overlay">
      <div class="confirm-dialog">
        <h3>Delete "{{ confirmDelete.name }}"?</h3>
        <p>This action cannot be undone.</p>
        <div class="btn-row">
          <button class="btn-danger" @click="confirmDeleteNode">Delete</button>
          <button class="btn-secondary" @click="confirmDelete = null">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <svg ref="svgRef"></svg>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as d3 from "d3";

const API = process.env.VUE_APP_API_URL || "";

export default {
  setup() {
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const svgRef = ref(null);
    const newNode = ref({ name: "", description: "", parent: "" });
    const selectedNode = ref(null);
    const editNode = ref(null);
    const confirmDelete = ref(null);

    async function fetchAndRender() {
      loading.value = true;
      error.value = null;
      try {
        const response = await fetch(`${API}/data`);
        if (!response.ok) throw new Error("Failed to Fetch");
        const fetchedData = await response.json();
        data.value = fetchedData;
        renderTree(fetchedData);
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    }

    function renderTree(fetchedData) {
      const svgEl = d3.select(svgRef.value);
      svgEl.selectAll("*").remove();

      const width = 928;

      const stratify = d3
        .stratify()
        .id((d) => d.name)
        .parentId((d) => d.parent || null);

      const root = stratify(fetchedData).sort(
        (a, b) => a.height - b.height || a.data.name.localeCompare(b.data.name)
      );

      const dx = 100;
      const dy = width / (root.height + 1);
      const tree = d3.tree().nodeSize([dx, dy]);

      root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
      tree(root);

      let x0 = Infinity;
      let x1 = -x0;
      root.each((d) => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
      });

      const height = x1 - x0 + dx * 2;

      svgEl
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-dy / 3, x0 - dx, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

      svgEl
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll()
        .data(root.links())
        .join("path")
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        );

      const node = svgEl
        .append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll()
        .data(root.descendants())
        .join("g")
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

      const nodeGroup = node
        .append("g")
        .attr("cursor", "pointer")
        .on("click", (_event, d) => {
          selectedNode.value = d.data;
          editNode.value = null;
        });

      nodeGroup
        .append("rect")
        .attr("width", 100)
        .attr("height", 50)
        .attr("stroke", (d) =>
          selectedNode.value && selectedNode.value.name === d.data.name
            ? "#007bff"
            : "black"
        )
        .attr("stroke-width", (d) =>
          selectedNode.value && selectedNode.value.name === d.data.name ? 3 : 1
        )
        .attr("fill", (d) => (d.children ? "white" : "#666"))
        .attr("x", -50)
        .attr("y", -25);

      nodeGroup
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .text((d) => d.data.name)
        .attr("fill", (d) => (d.children ? "black" : "white"))
        .attr("paint-order", "stroke");
    }

    function startEdit() {
      editNode.value = {
        _id: selectedNode.value._id,
        name: selectedNode.value.name,
        description: selectedNode.value.description,
      };
      selectedNode.value = null;
    }

    async function addNode() {
      if (!newNode.value.name) {
        error.value = "Name is required.";
        return;
      }
      if (!newNode.value.parent) {
        const hasRoot = data.value && data.value.some((d) => !d.parent);
        if (hasRoot) {
          error.value =
            "A root node already exists. Please specify a parent node.";
          return;
        }
      }
      error.value = null;
      try {
        const res = await fetch(`${API}/data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNode.value),
        });
        if (!res.ok) throw new Error("Failed to add node");
        newNode.value = { name: "", description: "", parent: "" };
        await fetchAndRender();
      } catch (err) {
        error.value = err.message;
      }
    }

    async function saveEdit() {
      try {
        const res = await fetch(`${API}/data/${editNode.value._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editNode.value.name,
            description: editNode.value.description,
          }),
        });
        if (!res.ok) throw new Error("Failed to update node");
        editNode.value = null;
        await fetchAndRender();
      } catch (err) {
        error.value = err.message;
      }
    }

    async function deleteNode(id) {
      try {
        const res = await fetch(`${API}/data/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete node");
        selectedNode.value = null;
        await fetchAndRender();
      } catch (err) {
        error.value = err.message;
      }
    }

    async function confirmDeleteNode() {
      await deleteNode(confirmDelete.value._id);
      confirmDelete.value = null;
    }

    onMounted(fetchAndRender);

    return {
      data,
      loading,
      error,
      svgRef,
      newNode,
      selectedNode,
      editNode,
      confirmDelete,
      addNode,
      saveEdit,
      deleteNode,
      startEdit,
      confirmDeleteNode,
    };
  },
};
</script>

<style scoped>
.app {
  text-align: center;
  font-family: sans-serif;
}
.error {
  color: red;
  margin: 8px 0;
}
.loading {
  color: #555;
}
.panels {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin: 16px;
}
.form-panel {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  min-width: 240px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}
.form-panel h2 {
  margin: 0 0 8px;
  font-size: 16px;
}
.form-panel label {
  font-size: 12px;
  color: #555;
  margin-bottom: -4px;
}
.form-panel input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}
.description {
  font-size: 13px;
  color: #444;
  margin: 0;
}
.btn-row {
  display: flex;
  gap: 8px;
}
.btn-primary {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: white;
  font-size: 13px;
}
.btn-danger {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #dc3545;
  color: white;
  font-size: 13px;
}
.btn-secondary {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #6c757d;
  color: white;
  font-size: 13px;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.confirm-dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 280px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.confirm-dialog h3 {
  margin: 0 0 8px;
}
.confirm-dialog p {
  color: #666;
  margin: 0 0 16px;
  font-size: 13px;
}
.confirm-dialog .btn-row {
  justify-content: center;
}
</style>
