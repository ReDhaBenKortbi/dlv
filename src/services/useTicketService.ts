import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { notify } from "../utils/toast";

export const useTicketService = () => {
  const queryClient = useQueryClient();

  // 1. Fetch Tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  });

  // 2. Resolve Mutation
  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      await updateDoc(doc(db, "tickets", id), { status: "resolved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "tickets", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  // Wrapper functions for the UI
  const handleResolve = (id: string) => {
    notify.promise(resolveMutation.mutateAsync(id), {
      loading: "Marking as resolved...",
      success: "Ticket resolved! ✅",
      error: "Could not update ticket.",
    });
  };

  const handleRemove = (id: string) => {
    if (!window.confirm("Delete permanently?")) return;
    notify.promise(deleteMutation.mutateAsync(id), {
      loading: "Deleting...",
      success: "Ticket deleted. 🗑️",
      error: "Could not delete ticket.",
    });
  };

  return { tickets, isLoading, handleResolve, handleRemove };
};
