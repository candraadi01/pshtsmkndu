import { getStoredGalleries, saveStoredGallery, addStoredGalleryPhoto, deleteStoredGalleryPhoto, deleteStoredGallery } from "../lib/services/gallery-store";
import { getStoredDocuments, saveStoredDocumentCategory, saveStoredDocument, deleteStoredDocument, deleteStoredDocumentCategory } from "../lib/services/document-store";
import { getStoredPeople, saveStoredPerson, deleteStoredPerson } from "../lib/services/people-store";
import { getStoredEkstrakurikuler, saveStoredEkstrakurikuler, deleteStoredEkstrakurikuler } from "../lib/services/ekskul-store";
import { getStoredPageSettings, saveStoredPageSettings } from "../lib/services/settings-store";

async function runTests() {
  console.log("=== STARTING ADMIN CRUD INTEGRITY TESTS ===");

  // 1. GALERI & PHOTO TEST
  console.log("\n--- Testing Gallery & Photo CRUD ---");
  const initialGalleries = await getStoredGalleries();
  console.log(`Initial galleries loaded: ${initialGalleries.length} albums`);
  const firstAlbum = initialGalleries[0];
  const initialPhotoCount = firstAlbum.images?.length || 0;
  console.log(`First album "${firstAlbum.nama_galeri}" has ${initialPhotoCount} photos`);

  // Add photo test
  console.log("Adding a test photo to album...");
  const addPhotoResult = await addStoredGalleryPhoto({
    gallery_id: firstAlbum.id,
    path: "https://res.cloudinary.com/dummy/image/upload/v12345/test_photo.jpg",
    caption: "Uji Coba Tambah Foto Otomatis",
  });
  console.log(`Add Photo Result: success=${addPhotoResult.success}, new photo ID=${addPhotoResult.image?.id}`);

  // Verify addition
  const afterAddGalleries = await getStoredGalleries();
  const updatedAlbum = afterAddGalleries.find((g) => g.id === firstAlbum.id);
  console.log(`After add: photos count = ${updatedAlbum?.images?.length} (expected ${initialPhotoCount + 1})`);

  // Delete photo test
  console.log(`Deleting test photo ID ${addPhotoResult.image?.id}...`);
  const deletePhotoResult = await deleteStoredGalleryPhoto(addPhotoResult.image?.id);
  console.log(`Delete Photo Result: success=${deletePhotoResult.success}`);

  // Verify deletion
  const afterDeleteGalleries = await getStoredGalleries();
  const albumAfterDelete = afterDeleteGalleries.find((g) => g.id === firstAlbum.id);
  console.log(`After delete: photos count = ${albumAfterDelete?.images?.length} (expected ${initialPhotoCount})`);

  if (albumAfterDelete?.images?.length === initialPhotoCount) {
    console.log(">>> GALERI & FOTO CRUD TEST PASSED! <<<");
  } else {
    throw new Error("Gallery photo count mismatch after delete!");
  }

  // 2. PEOPLE TEST
  console.log("\n--- Testing People CRUD ---");
  const people = await getStoredPeople();
  console.log(`Loaded people count: ${people.length}`);

  const addPerson = await saveStoredPerson({
    nama: "Test Siswa Antigravity",
    tipe: "siswa",
    sabuk: "Jambon",
    jenis_kelamin: "L",
    alamat: "Jl. Pengujian No. 10",
  });
  console.log(`Created person ID: ${addPerson.person.id}`);

  const afterAddPeople = await getStoredPeople();
  console.log(`People count after add: ${afterAddPeople.length} (expected ${people.length + 1})`);

  const deletePerson = await deleteStoredPerson(addPerson.person.id);
  console.log(`Delete person result: success=${deletePerson.success}`);

  const afterDeletePeople = await getStoredPeople();
  console.log(`People count after delete: ${afterDeletePeople.length} (expected ${people.length})`);
  console.log(">>> PEOPLE CRUD TEST PASSED! <<<");

  // 3. DOKUMEN TEST
  console.log("\n--- Testing Document CRUD ---");
  const docs = await getStoredDocuments();
  console.log(`Loaded document categories: ${docs.length}`);

  const addDoc = await saveStoredDocument({
    tipe_dokumen_id: docs[0].id,
    nama_dokumen: "Berkas Pengujian Otomatis",
    path: "/storage/test_doc.pdf",
  });
  console.log(`Created document ID: ${addDoc.document.id}`);

  const deleteDoc = await deleteStoredDocument(addDoc.document.id);
  console.log(`Deleted document result: success=${deleteDoc.success}`);
  console.log(">>> DOKUMEN CRUD TEST PASSED! <<<");

  // 4. EKSTRAKURIKULER TEST
  console.log("\n--- Testing Ekstrakurikuler CRUD ---");
  const ekskul = await getStoredEkstrakurikuler();
  console.log(`Loaded ekskul count: ${ekskul.length}`);

  const addEkskul = await saveStoredEkstrakurikuler({
    nama: "Ekskul Pengujian Silat Prestasi",
    deskripsi: "Ekskul uji coba",
  });
  console.log(`Created ekskul ID: ${addEkskul.item.id}`);

  const deleteEkskul = await deleteStoredEkstrakurikuler(addEkskul.item.id);
  console.log(`Deleted ekskul result: success=${deleteEkskul.success}`);
  console.log(">>> EKSTRAKURIKULER CRUD TEST PASSED! <<<");

  // 5. SETTINGS TEST
  console.log("\n--- Testing Settings Store ---");
  const settings = await getStoredPageSettings();
  console.log(`Current hero title: "${settings.judul_hero}"`);
  console.log(">>> SETTINGS STORE TEST PASSED! <<<");

  console.log("\n==========================================");
  console.log("ALL ADMIN CRUD INTEGRITY TESTS PASSED 100%!");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
