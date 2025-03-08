<h2>Add New Room</h2>
<form action="#" method="POST" id="new-room-form" name="new-room-form">
    <div class="form-group">
        <label for="room-name">Room Name</label>
        <input type="text" id="room-name" name="room_name" placeholder="e.g. Living Room" required>
    </div>
    <div class="inline-group">
        <div class="form-group">
            <label for="room-width">Width (m)</label>
            <input type="number" id="room-width" name="room_width" placeholder="Width" required step="0.01">
        </div>
        <div class="form-group">
            <label for="room-length">Length (m)</label>
            <input type="number" id="room-length" name="room_length" placeholder="Length" required step="0.01">
        </div>
    </div>
    <div class="button-group">
        <button type="submit" class="submit-btn">Add Room</button>
        <button type="button" class="cancel-btn">Cancel</button>
    </div>
</form>
