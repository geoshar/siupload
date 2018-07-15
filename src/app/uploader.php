<?php
$action = $_POST['act'];
switch ($action) {
    case 'upload':
        $settings      = json_decode($_POST['settings'], true);
        $file_tmp      = $_FILES['upl']['tmp_name'];
        $file_name     = totranslit($_FILES['upl']['name']);
        $file_rename   = substr(md5($_TIME + rand(1, 100000)), 0, 10);
        $file_rerename = '_' . $file_rename;
        $file_size     = $_FILES['upl']['size'];
        $type          = strtolower(end(explode(".", $file_name)));
        $res_type      = '.' . $type;
        $link          = '/' . $settings['folder'] . '/file_' . $file_rename . $res_type; //date("Y.m.d")
        $ROOT          = $_SERVER['DOCUMENT_ROOT'];
        $folder        = $ROOT . '/' . $settings['folder'];
        if (!is_dir($folder)) {
            $folderSplit = explode('/', $settings['folder']);
            $directories = '';
            foreach ($folderSplit as $key => $f) {
                $directories .= '/' . $f;
                $dir = $ROOT . $directories;
                if (!is_dir($dir)) {
                    mkdir($ROOT . $directories, 0777);
                }
            }
        }
        $moveTo = $ROOT . '/' . $link;
        if (move_uploaded_file($file_tmp, $moveTo)) {
            @chmod($moveTo, 0777);
            $data         = [];
            $data['link'] = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . $link;
            echo json_encode($data);

        }
        # code...
        break;

    default:
        # code...
        break;
}

function totranslit($var, $lower = true, $punkt = true)
{
    global $langtranslit;

    if (is_array($var)) {
        return "";
    }

    if (!is_array($langtranslit) or !count($langtranslit)) {
        $var = trim(strip_tags($var));

        if ($punkt) {
            $var = preg_replace("/[^a-z0-9\_\-.]+/mi", "", $var);
        } else {
            $var = preg_replace("/[^a-z0-9\_\-]+/mi", "", $var);
        }

        $var = preg_replace('#[.]+#i', '.', $var);
        $var = str_ireplace(".php", ".ppp", $var);

        if ($lower) {
            $var = strtolower($var);
        }

        return $var;
    }

    $var = trim(strip_tags($var));
    $var = preg_replace("/\s+/ms", "-", $var);
    $var = str_replace("/", "-", $var);

    $var = strtr($var, $langtranslit);

    if ($punkt) {
        $var = preg_replace("/[^a-z0-9\_\-.]+/mi", "", $var);
    } else {
        $var = preg_replace("/[^a-z0-9\_\-]+/mi", "", $var);
    }

    $var = preg_replace('#[\-]+#i', '-', $var);
    $var = preg_replace('#[.]+#i', '.', $var);

    if ($lower) {
        $var = strtolower($var);
    }

    $var = str_ireplace(".php", "", $var);
    $var = str_ireplace(".php", ".ppp", $var);

    if (strlen($var) > 200) {

        $var = substr($var, 0, 200);

        if (($temp_max = strrpos($var, '-'))) {
            $var = substr($var, 0, $temp_max);
        }

    }

    return $var;
}
