<?php
if (!empty($this->footer_text)) {
//                    $html_footer .= '<div style="width:60%;">' . $this->footer_text . '</div>';
}

// Right side - Contact details (40% width)
if (!empty($this->footer_contact_details)) { ?>
    <style>

    </style>
    <div style="width:40%; text-align:left; float:left;"><?= $this->footer_contact_details ?></div>
<?php
}
?>
