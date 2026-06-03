import { Metadata } from "next";
import TasksClient from "./TasksClient";

export const metadata: Metadata = {
  title: "المهام | شَريك",
  description: "إدارة المهام والأعمال",
};

export default function TasksPage() {
  return <TasksClient />;
}
