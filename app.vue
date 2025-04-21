<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">📒 Notes</h1>

    <!-- ฟอร์มเพิ่มโน้ต -->
    <form
      @submit.prevent="createNote"
      class="mb-10 flex flex-col gap-4 bg-base-100 p-4 rounded-box shadow"
    >
      <input
        v-model="newNote.header"
        type="text"
        placeholder="หัวข้อ"
        class="input input-bordered w-full"
        required
      />
      <textarea
        v-model="newNote.content"
        placeholder="เนื้อหา"
        class="textarea textarea-bordered w-full"
        required
      ></textarea>
      <input
        type="file"
        @change="(e: any) => handleCreateImage(e.target.files?.[0])"
        class="file-input file-input-bordered w-full"
      />
      <div
        v-if="createImagePreview"
        class="my-4 flex items-center justify-center"
      >
        <img
          :src="createImagePreview"
          alt="Image Preview"
          class="rounded-full h-36 w-36"
        />
      </div>
      <button type="submit" class="btn btn-primary">เพิ่มโน้ต</button>
    </form>

    <!-- รายการโน้ตทั้งหมด -->
    <div
      v-if="notes.length > 0"
      v-for="note in notes"
      :key="note.id"
      class="card bg-base-200 shadow-md mb-6"
    >
      <div class="card-body">
        <!-- แก้ไข -->
        <template v-if="editModeId === note.id">
          <input
            v-model="editNoteData.header"
            type="text"
            class="input input-bordered w-full mb-2"
          />
          <textarea
            v-model="editNoteData.content"
            class="textarea textarea-bordered w-full mb-2"
          ></textarea>
          <input
            type="file"
            @change="handleEditImage"
            class="file-input file-input-bordered w-full mb-2"
          />
          <img
            v-if="editImagePreview || editNoteData.image"
            :src="editImagePreview || editNoteData.image"
            class="mt-2 max-w-xs h-36 w-36 rounded-full"
          />
          <div class="mt-4 flex gap-2">
            <button @click="updateNote(note.id)" class="btn btn-success btn-sm">
              บันทึก
            </button>
            <button @click="cancelEdit" class="btn btn-secondary btn-sm">
              ยกเลิก
            </button>
          </div>
        </template>

        <!-- แสดงโน้ต -->
        <template v-else>
          <h2 class="card-title text-xl">{{ note.header }}</h2>
          <p>{{ note.content }}</p>
          <img
            v-if="note.image"
            :src="note.image"
            class="mt-2 max-w-xs h-36 w-36 rounded-full"
          />
          <p class="text-sm text-gray-500 mt-2">
            {{ formatDate(note.createdAt) }}
          </p>
          <div class="mt-4 flex gap-2">
            <button @click="startEditNote(note)" class="btn btn-info btn-sm">
              แก้ไข
            </button>
            <button @click="deleteNote(note.id)" class="btn btn-error btn-sm">
              ลบ
            </button>
          </div>
        </template>
      </div>
    </div>

    <div v-else class="text-center">📝 ไม่มีโน้ตนตอนนี้ เพิ่มโน้ตสิ</div>
  </div>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";

const notes = ref<any[]>([]);
const createImagePreview = ref<string | null>(null);
const editImagePreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const newNote = ref({
  header: "",
  content: "",
  image: "",
});

const editNoteData = ref({
  header: "",
  content: "",
  image: "",
});

const editModeId = ref<number | null>(null);

const fetchNotes = async () => {
  notes.value = await $fetch("/api/note");
};
onMounted(fetchNotes);

// ฟังก์ชันสำหรับอัปโหลดภาพ
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const res: any = await $fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  return res.url;
};

const handleCreateImage = (file: File | undefined) => {
  if (!file) return;

  selectedFile.value = file;
  // image preview
  createImagePreview.value = URL.createObjectURL(file);
};

const handleEditImage = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  editImagePreview.value = URL.createObjectURL(file);
  editNoteData.value.image = await uploadImage(file);
};

const createNote = async () => {
  try {
    if (selectedFile.value) {
      const imageUrl = await uploadImage(selectedFile.value);
      newNote.value.image = imageUrl;
    }

    await $fetch("/api/note", {
      method: "POST",
      body: newNote.value,
    });

    newNote.value = { header: "", content: "", image: "" };
    selectedFile.value = null;
    createImagePreview.value = null;

    const fileInput =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) fileInput.value = "";

    fetchNotes();

    Swal.fire({
      icon: "success",
      title: "เพิ่มโน้ตสำเร็จ",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถเพิ่มโน้ตได้",
    });
  }
};

const deleteNote = async (id: number) => {
  const result = await Swal.fire({
    title: "ยืนยันการลบ?",
    text: "คุณต้องการลบโน้ตนี้ใช่หรือไม่",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ลบ",
    cancelButtonText: "ยกเลิก",
  });

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/note/${id}`, { method: "DELETE" });
      fetchNotes();

      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ลบไม่สำเร็จ",
      });
    }
  }
};

const startEditNote = (note: any) => {
  editNoteData.value = {
    header: note.header,
    content: note.content,
    image: note.image,
  };
  editImagePreview.value = null;
  editModeId.value = note.id;
};

const cancelEdit = () => {
  editModeId.value = null;
  editImagePreview.value = null;
};

const updateNote = async (id: number) => {
  try {
    await $fetch(`/api/note/${id}`, {
      method: "PUT",
      body: editNoteData.value,
    });
    editModeId.value = null;
    editImagePreview.value = null;
    fetchNotes();

    Swal.fire({
      icon: "success",
      title: "แก้ไขโน้ตเรียบร้อย",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถแก้ไขโน้ตได้",
    });
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString();
};
</script>
