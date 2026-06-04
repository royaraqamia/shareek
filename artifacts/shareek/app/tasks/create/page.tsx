import { Metadata } from "next";
import CreateTaskClient from "./CreateTaskClient";

export const metadata: Metadata = {
  title: "إضافة مهمة | شَريك",
  description: "إضافة مهمة جديدة",
};

export default function CreateTaskPage() {
  return <CreateTaskClient />;
}
