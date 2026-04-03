<template>
  <svg ref="svgRef"></svg>
</template>

<script>
import { ref, watch, onMounted } from "vue";
import * as d3 from "d3";

export default {
  name: "TreeView",
  props: {
    nodes: {
      type: Array,
      required: true,
    },
    selectedNode: {
      type: Object,
      default: null,
    },
  },
  emits: ["node-click"],
  setup(props, { emit }) {
    const svgRef = ref(null);

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
          emit("node-click", d.data);
        });

      nodeGroup
        .append("rect")
        .attr("width", 100)
        .attr("height", 50)
        .attr("stroke", (d) =>
          props.selectedNode && props.selectedNode.name === d.data.name
            ? "#007bff"
            : "black"
        )
        .attr("stroke-width", (d) =>
          props.selectedNode && props.selectedNode.name === d.data.name ? 3 : 1
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

    onMounted(() => {
      if (props.nodes && props.nodes.length) renderTree(props.nodes);
    });

    watch(
      () => props.nodes,
      (nodes) => {
        if (nodes && nodes.length) renderTree(nodes);
      }
    );

    return { svgRef };
  },
};
</script>
