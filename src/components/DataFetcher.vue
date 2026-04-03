<script>
import { onMounted } from "vue";
import { fetchNodes } from "@/services/nodeService";

export default {
  name: "DataFetcher",
  emits: ["loaded", "error"],
  setup(_, { emit }) {
    onMounted(async () => {
      try {
        const nodes = await fetchNodes();
        emit("loaded", nodes);
      } catch (err) {
        emit("error", err.message);
      }
    });
  },
  render() {
    return null;
  },
};
</script>
