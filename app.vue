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
        @change="uploadImageToEditNote"
        class="file-input file-input-bordered w-full"
      />
      <!-- แสดงภาพตัวอย่าง -->
      <div v-if="imagePreview" class="my-4 flex items-center justify-center">
        <img
          :src="imagePreview"
          alt="Image Preview"
          class="rounded-full h-36 w-36"
        />
      </div>
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? "ยืนยันการแก้ไข" : "เพิ่มโน้ต" }}
      </button>
    </form>
    <!-- รายการโน้ตทั้งหมด -->
    <div
      v-if="notes.length > 0"
      v-for="note in notes"
      :key="note.id"
      class="card bg-base-200 shadow-md mb-6"
    >
      <div class="card-body">
        <!-- ถ้าอยู่ในโหมดแก้ไข -->
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
            @change="uploadImageToEditNote"
            class="file-input file-input-bordered w-full mb-2"
          />
          <img
            v-if="editNoteData.image"
            :src="editNoteData.image"
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

        <!-- ถ้าไม่ได้แก้ไข -->
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
    <div v-else class="text-center">📝 ไม่มีโน้ตนตอนนี้ เพิ่มโน็ตสิ</div>
  </div>
</template>
<script setup lang="ts">
const notes = ref<any>([]);
const imagePreview = ref<any>(null); // ตัวแปรสำหรับเก็บ URL ของภาพตัวอย่าง
const newNote = ref({
  header: "",
  content: "",
  image: "",
});
const editModeId = ref<number | null>(null); // ใช้เก็บ id ของโน้ตที่ต้องการแก้ไข
const editNoteData = ref({
  header: "",
  content: "",
  image: "",
});
const isEditing = ref(false);
const editingNoteId = ref<number | null>(null);

const fetchNotes = async () => {
  notes.value = await $fetch("/api/note");
};
onMounted(fetchNotes);

const createNote = async () => {
  if (isEditing.value && editingNoteId.value !== null) {
    await updateNote(editingNoteId.value);
    return;
  }

  await $fetch("/api/note", {
    method: "POST",
    body: newNote.value,
  });
  newNote.value = { header: "", content: "", image: "" };
  fetchNotes();
};

const deleteNote = async (id: number) => {
  await $fetch(`/api/note/${id}`, { method: "DELETE" });
  fetchNotes();
};

const startEditNote = (note: any) => {
  // ตั้งค่าโน้ตที่ต้องการแก้ไข
  editNoteData.value = {
    header: note.header,
    content: note.content,
    image: note.image,
  };
  editModeId.value = note.id; // เปลี่ยนโหมดเป็นการแก้ไข
};

const cancelEdit = () => {
  editModeId.value = null; // ยกเลิกการแก้ไข
};

const updateNote = async (id: any) => {
  // อัปเดตโน้ต
  await $fetch(`/api/note/${id}`, {
    method: "PUT",
    body: editNoteData.value,
  });
  editModeId.value = null; // ปิดโหมดแก้ไข
  fetchNotes(); // โหลดโน้ตใหม่
};

const uploadImageToEditNote = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // สร้าง URL ชั่วคราวสำหรับการแสดงภาพตัวอย่าง
  imagePreview.value = URL.createObjectURL(file);

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res: any = await $fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    // ตรวจสอบว่าตอบกลับสำเร็จและมี URL ของไฟล์ที่อัปโหลด
    if (res && res.url) {
      // อัพเดต URL ของรูปที่อัปโหลดลงในข้อมูลโน้ต
      editNoteData.value.image = res.url;
    } else {
      // หากไม่ได้รับ URL จากเซิร์ฟเวอร์, แสดงข้อผิดพลาด
      console.error("Failed to upload image");
    }
  } catch (error) {
    // หากมีข้อผิดพลาดในการอัปโหลด, แสดงข้อความข้อผิดพลาด
    console.error("Error uploading image:", error);
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString();
};
</script>
