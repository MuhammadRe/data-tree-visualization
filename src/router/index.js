import { createRouter, createWebHistory } from "vue-router";
import TreePage from "@/views/TreePage.vue";

const routes = [{ path: "/", component: TreePage }];

export default createRouter({
  history: createWebHistory(),
  routes,
});
