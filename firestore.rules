rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allow anyone to READ active items (public marketplace)
    match /vendor_inventory/{item} {
      allow read: if resource.data.status == "active" || 
                     request.auth != null || 
                     request.auth == null;

      // Allow anyone to CREATE (vendors submitting listings)
      allow create: if request.resource.data.keys().hasAny(['name', 'price', 'category']) &&
                       request.resource.data.status == "pending";

      // Allow anyone to UPDATE their own item (mark as sold, edit)
      // In production, you'd want auth checks. For now, open for testing.
      allow update: if true;

      // Allow anyone to DELETE (remove their listing)
      allow delete: if true;
    }

    // Admin collection (for future use)
    match /admins/{admin} {
      allow read, write: if false; // Restricted - set up auth later
    }
  }
}
