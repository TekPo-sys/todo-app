import { useState } from "react";
import { supabase } from "../supabaseClient";

const FIXED_CATEGORIES = ["none", "Work", "Personal", "Shopping", "Health"];

export function useCategories(session) {
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategoryText, setNewCategoryText] = useState("");
  const [detailsOpenId, setDetailsOpenId] = useState(null);

  const allCategories = [
    "none",
    ...FIXED_CATEGORIES.filter((c) => c !== "none"),
    ...customCategories.map((c) => c.name),
  ];

  async function fetchCustomCategories() {
    const { data, error } = await supabase
      .from('custom_categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) console.error(error);
    else setCustomCategories(data);
  }

  async function addCustomCategory() {
    const name = newCategoryText.trim();
    if (!name) return;
    const { data, error } = await supabase
      .from('custom_categories')
      .insert([{ name, user_id: session.user.id }])
      .select();
    if (error) console.error(error);
    else setCustomCategories((prev) => [...prev, data[0]]);
    setNewCategoryText("");
  }

  async function deleteCustomCategory(id) {
    const { error } = await supabase.from('custom_categories').delete().eq('id', id);
    if (error) console.error(error);
    else setCustomCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return {
    categoryOptions: FIXED_CATEGORIES, allCategories, customCategories,
    newCategoryText, setNewCategoryText, detailsOpenId, setDetailsOpenId,
    fetchCustomCategories, addCustomCategory, deleteCustomCategory,
  };
}