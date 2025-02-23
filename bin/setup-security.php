<?php
/**
 * Security Setup Script
 *
 * This script creates necessary security files across the plugin directory structure.
 * Run this script from the plugin root directory.
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    die('Direct access not permitted.');
}

class SecuritySetup {
    private $plugin_root;
    private $directories;
    private $sensitive_dirs;

    public function __construct() {
        $this->plugin_root = dirname(dirname(__FILE__));

        // List of directories that need index.php
        $this->directories = array(
            '',
            'admin',
            'admin/css',
            'admin/js',
            'admin/partials',
            'includes',
            'includes/admin',
            'includes/frontend',
            'public',
            'public/css',
            'public/js',
            'public/partials',
            'languages',
            'assets'
        );

        // Directories that need additional protection
        $this->sensitive_dirs = array(
            'languages',
            'includes'
        );
    }

    /**
     * Run the setup process
     */
    public function run() {
        $this->createIndexFiles();
        $this->createHtaccessFiles();
        $this->setDirectoryPermissions();
    }

    /**
     * Create index.php files
     */
    private function createIndexFiles() {
        $index_content = "<?php\n// Silence is golden.";

        foreach ($this->directories as $dir) {
            $full_path = $this->plugin_root . '/' . $dir;

            if (!is_dir($full_path)) {
                if (!mkdir($full_path, 0755, true)) {
                    $this->log("Failed to create directory: {$dir}");
                    continue;
                }
            }

            $index_file = $full_path . '/index.php';

            if (!file_exists($index_file)) {
                if (file_put_contents($index_file, $index_content) === false) {
                    $this->log("Failed to create index.php in: {$dir}");
                }
            }
        }
    }

    /**
     * Create .htaccess files for sensitive directories
     */
    private function createHtaccessFiles() {
        $htaccess_content = "
<Files *>
    Order deny,allow
    Deny from all
</Files>

# Disable directory browsing
Options -Indexes

# Protect files
<FilesMatch \"^.*\.(log|txt|md|pot|po|mo)$\">
    Order deny,allow
    Deny from all
</FilesMatch>

# Protect against script injections
<FilesMatch \"^.*\.([Pp][Hh][Pp])$\">
    Order Deny,Allow
    Deny from all
</FilesMatch>

# Allow specific PHP files
<FilesMatch \"^(index|plugin-name)\.php$\">
    Order Allow,Deny
    Allow from all
</FilesMatch>

# Block malicious requests
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} ^(HEAD|TRACE|DELETE|TRACK|DEBUG) [NC]
    RewriteRule ^(.*)$ - [F,L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options \"nosniff\"
    Header set X-XSS-Protection \"1; mode=block\"
    Header set X-Frame-Options \"SAMEORIGIN\"
    Header set X-Permitted-Cross-Domain-Policies \"none\"
    Header set Referrer-Policy \"same-origin\"
</IfModule>
";

        foreach ($this->sensitive_dirs as $dir) {
            $full_path = $this->plugin_root . '/' . $dir;
            $htaccess_file = $full_path . '/.htaccess';

            if (!file_exists($htaccess_file)) {
                if (file_put_contents($htaccess_file, $htaccess_content) === false) {
                    $this->log("Failed to create .htaccess in: {$dir}");
                }
            }
        }
    }

    /**
     * Set proper directory permissions
     */
    private function setDirectoryPermissions() {
        foreach ($this->directories as $dir) {
            $full_path = $this->plugin_root . '/' . $dir;

            if (is_dir($full_path)) {
                // Set directory permissions to 755
                if (!chmod($full_path, 0755)) {
                    $this->log("Failed to set directory permissions for: {$dir}");
                }

                // Set file permissions to 644
                $files = glob($full_path . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        if (!chmod($file, 0644)) {
                            $this->log("Failed to set file permissions for: {$file}");
                        }
                    }
                }
            }
        }
    }

    /**
     * Log messages if WP_DEBUG is enabled
     */
    private function log($message) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Product Estimator Security Setup: ' . $message);
        }
    }
}

// Run the setup
$security_setup = new SecuritySetup();
$security_setup->run();