$(document).ready(function() {
    var uploader = $('#uploader');
    var container = uploader.find('.container');
    var dropper = uploader.find('.dropper');
    var controllers = uploader.find('.controllers');
    var submit = controllers.find('.audsubmit');

    var UploadObject = {
        maxFileSize: 6000, //60 mb
        MaxFiles: 100, //max files upload at once
        Format: 'mp3|mp4|flac', //format file type
        folder: 'uploader/uploads' // folder upload
    };
    var errors = {
        format: 'Недопустимый формат',
        size: 'Недопустимый размер',
        repeat: 'Повтор'
    };

    var IndexIt = 0;
    $(function() {
        var input_folder = controllers.find('.input-folder');
        controllers.find('.audselect').click(function() {
            uploader.find('#input').click();
        });
        input_folder.val(UploadObject.folder);


        var jqXHR = uploader.fileupload({
            maxfiles: UploadObject.MaxFiles,
            maxfilesize: UploadObject.maxFileSize,
            sequentialUploads: true,
            url: 'uploader.php',
            formData: {
                act: 'upload',
                settings: {
                    folder: UploadObject.folder
                }
            },
            dropZone: dropper,
            add: function(e, data) {
                //console.log(data.options);
                var goUpload = true;
                var file = data.files[0];
                var FileFormat = new RegExp('\.(' + UploadObject.Format + ')', "i");
                if (!(FileFormat).test(file.name)) {
                    alert(errors.format);
                    goUpload = false;
                }
                UploadObject.fileSize = formatFileSize(file.size, true);
                UploadObject.fileSizeMB = (file.size / 1000000).toFixed(2);


                //console.log('ThisFile:'+fileSizeMB +' Upload:'+maxFileSize);
                if (UploadObject.fileSizeMB > UploadObject.maxFileSize) {
                    alert(errors.size);
                    goUpload = false;
                }
                uploader.find('.file').each(function(i) {
                    if (this.id == file.name + file.size) {
                        alert(errors.repeat);
                        goUpload = false;
                    }
                });
                if (goUpload == true) {
                    var url = file.urn || file.name;
                    var url_local = URL.createObjectURL(file);
                    var formatsize = formatFileSize(file.size, true);
                    var tpl = $(
                        '<div id="' + file.name + file.size + '" class="file" data-url="' + url_local + '">' +
                        '<div class="info">' +
                        '<span class="name">' + file.name + '</span>' +
                        '<span class="size"> ' + formatsize + '</span>' +
                        '<span class="percent"></span>' +
                        '<a class="link" href=""></a>' +
                        '</div>' +
                        '<div class="pre_loder"><div class="loder"></div></div>' +
                        '<div class="file-controllers">' +
                        '<button class="submit button">Загрузить</button>' +
                        '<button class="itsok button">Убрать</button>' +
                        '</div>' +
                        //'<span class="aud_proc"></span>'+ 
                        //'<input class="knob" data-width="50" data-height="50" data-readOnly="1" data-fgColor="#0788a5" data-bgColor="#3e4043" data-skin="tron" data-thickness=".2" value="0">'
                        +'</div>');
                    data.context = tpl.hide().appendTo(container).fadeIn(300);
                    // Initialize the knob plugin
                    //tpl.find('input').knob();

                    submit.removeAttr('disabled');
                    tpl.find('.itsok').click(function() {
                        if (tpl.hasClass('working')) {
                            jqXHR.abort();
                        }
                        tpl.fadeOut(function() {
                            tpl.remove();
                        });
                    });
                    tpl.find('.submit').click(function() {
                        data.onSett({
                            folder: input_folder.val()
                        });
                        jqXHR = data.submit();
                    });
                    submit.click(function() {
                        data.onSett({
                            folder: input_folder.val()
                        });
                        jqXHR = data.submit();
                    });
                    IndexIt++;

                }
            },
            submit: function(e, data) {
                $('#start-upload').on('click', function() {
                    //$('#start-upload').addClass('#disabledInput');
                    console.log("This is the start upload button!");
                });
            },
            done: function(e, data) {
                //alert(data.result);
                response = JSON.parse(data.result);
                //$('[id$="' + data.files[0].name + data.files[0].size + '"]').find('.aud_inf').remove();
                //if (response[3] == undefined && response[2] == undefined && response[5] == undefined) {
                // setboxmsg(data.result, 'error', 100000);
                // }
                //alert(response.link);
                $copylink = $('<button class="button link">скопировать ссылку</button>');
                $copylink.on('click', function() {
                    // var text_val = eval(this);
                    // text_val.focus();
                    // text_val.select();
                    // if (!r.execCommand) return; // feature detection
                    // r = text_val.createTextRange();
                    // r.execCommand('copy');
                    prompt("Скопировать ссылку ", response.link);
                });
                $('[id$="' + data.files[0].name + data.files[0].size + '"]').find('.file-controllers').prepend($copylink);
                //alert(response.folder);
                //setboxmsg(data.result, 'error', 100000);
                //$('[id$="' + data.files[0].name + data.files[0].size + '"]').append('<div class="aud_inf"><span class="name_ar" id="artis' + response[1] + '">' + response[3] + '</span> – <span class="name_tit"id="name' + response[1] + '">' + response[2] + '</span> – <span class="name_al">' + response[5] + '</span></div>');
            },
            progress: function(e, data) {
                // Calculate the completion percentage of the upload
                var progress = parseInt(data.loaded / data.total * 100, 10);
                // Update the hidden input field and trigger a change
                // so that the jQuery knob plugin knows to update the dial
                //data.context.find('input').val(progress).change();
                data.context.find('.loder').css('width', progress + '%');
                data.context.find('.percent').html(progress + '%');
                //data.context.find('.aud_proc').html(progress + '%');
                data.context.addClass('working');
                if (progress == 100) {
                    data.context.find('.submit').remove();
                    data.context.removeClass('working');
                    data.context.addClass('uploaded');
                }
            },
            progressall: function(e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                var FilesLoaded = 0;
                var FilesCount = 0;
                container.find('.file').each(function() {
                    $This = $(this);
                    FilesCount++;
                    if ($This.hasClass('uploaded')) FilesLoaded++;
                });
                $('#progress').css('width', progress + '%');
                $('.progress-text').text('Загружено:' + progress + '% ' + FilesLoaded + ' Из ' + FilesCount);
                //$('.cme-progress-text').html('Загружено:'+progress + '%,'+FilesLoaded+' Из '+FilesCount);
            },
            fail: function(e, data) {
                // Something has gone wrong!
                data.context.addClass('error');
            },
            stop: function(e) {
                submit.attr('disabled', '');
            }
        });
        $('#upload_it').bind('fileuploadchunkdone', function(e, data) {

        });
        $('#upload_it').bind('fileuploadsubmit', function(e, data) {
            if (data.context.hasClass('uploaded')) {
                data.context.find('.submit').prop('disabled', false);
                return false;
            }
        });
        // Prevent the default action when a file is dropped on the window
        $(document).on('drop dragover', function(e) {
            e.preventDefault();
        });
    });
});

function formatFileSize(size, noS) {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    var ret = (size / Math.pow(1024, i)).toFixed(2) * 1;
    if (noS === true) {
        ret += ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }
    return ret;

};