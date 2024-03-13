<template>
  <div>
    <h1>Data Tree Visualization</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <svg ref="svgRef"></svg>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as d3 from "d3";

export default {
  setup() {
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const svgRef = ref(null);

    onMounted(async () => {
      loading.value = true;
      try {
        const response = await fetch(
          "https://data-tree-c7f5af2a0b76.herokuapp.com/data"
        );
        if (!response.ok) throw new Error("Failed to Fetch");
        const fetchedData = await response.json();
        data.value = fetchedData;

        const svg = d3.select(svgRef.value);
        const width = 928;

        const stratify = d3
          .stratify()
          .id((d) => d.name)
          .parentId((d) => d.parent || null); // Treat empty string as null for the root node

        const root = stratify(fetchedData).sort(
          (a, b) =>
            a.height - b.height || a.data.name.localeCompare(b.data.name)
        );

        // Compute the tree height; this approach will allow the height of the
        // SVG to scale according to the breadth (width) of the tree layout.
        const dx = 100;
        const dy = width / (root.height + 1);

        // Create a tree layout.
        const tree = d3.tree().nodeSize([dx, dy]);

        // Sort the tree and apply the layout.
        root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
        tree(root);

        // tree extends right rather than down.
        let x0 = Infinity;
        let x1 = -x0;
        root.each((d) => {
          if (d.x > x1) x1 = d.x;
          if (d.x < x0) x0 = d.x;
        });

        // Compute the adjusted height of the tree.
        const height = x1 - x0 + dx * 2;

        svg
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [-dy / 3, x0 - dx, width, height])
          .attr(
            "style",
            "max-width: 100%; height: auto; font: 10px sans-serif;"
          );

        svg
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
        const node = svg
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
          .on("click", (event, d) => {
            d3.select(event.currentTarget)
              .select("rect")
              .attr("stroke-width", 4);
            setTimeout(() => {
              alert(`${d.data.name}\n${d.data.description}`);
              d3.selectAll("rect").attr("stroke-width", 1);
            }, 10);
          });

        nodeGroup
          .append("rect")
          .attr("width", 100)
          .attr("height", 50)
          .attr("stroke", "black") // Border color
          .attr("stroke-width", 1) // Border width
          .attr("fill", (d) => (d.children ? "white" : "#666")) // Background color for parents and children
          .attr("x", -50)
          .attr("y", -25);

        nodeGroup
          .append("text")
          .attr("dy", "0.31em")
          .attr("x", 0)
          .attr("text-anchor", "middle")
          .text((d) => d.data.name)
          .attr("fill", (d) => (d.children ? "black" : "white")) // Text color for parents and children
          .attr("paint-order", "stroke");
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    });

    return { data, loading, error, svgRef };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.error {
  color: red;
}
</style>
