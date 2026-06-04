document.addEventListener("DOMContentLoaded", function() {
    const settings = window.natuSettings || {};
    
    for (let id in settings) {
        if (!id.startsWith('cate')) continue;
        let url = settings[id];
        if (!url) continue;

        let elById = document.getElementById(id);
        if (elById) elById.href = url;
        
        let classElements = document.querySelectorAll('.set-' + id);
        classElements.forEach(function(el) {
            el.href = url;
        });
    }
    
    var hamBtn = document.getElementById('hamburger-btn');
    var clsBtn = document.getElementById('close-btn');
    var slideMenu = document.getElementById('slide-menu');
    var menuOverlay = document.getElementById('menu-overlay');
    if(hamBtn && clsBtn && slideMenu && menuOverlay) {
        var toggleMenu = function() {
            slideMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        };
        hamBtn.addEventListener('click', toggleMenu);
        clsBtn.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', toggleMenu);
    }

    var commentBtn = document.getElementById('toggle-comment-btn');
    var commentBox = document.getElementById('js-comment-accordion-box');
    if (commentBtn && commentBox) {
        commentBtn.addEventListener('click', function() {
            if (commentBox.style.display === 'none') {
                commentBox.style.display = 'block';
            } else {
                commentBox.style.display = 'none';
            }
        });
    }
});


// ==========================================
// jQuery必須の個別記事専用処理
// ==========================================
if (typeof jQuery !== 'undefined') {
    jQuery(function($) {
        const settings = window.natuSettings || {};
        
        // --- 1. 目次データの生成（移動はせず、データだけ作る） ---
        var idcount = 1;
        var tocList = '';
        var currentlevel = 0;
        
        // H2とH3にIDを付与しながらリストを作成
        $("article h2, article h3").each(function() {
            this.id = "toc-" + idcount;
            idcount++;
            var level = (this.nodeName.toLowerCase() == "h2") ? 1 : 2;
            while (currentlevel < level) { tocList += "<ol>"; currentlevel++; }
            while (currentlevel > level) { tocList += "</ol>"; currentlevel--; }
            tocList += '<li><a href="#' + this.id + '">' + $(this).html() + "</a></li>\n";
        });
        while (currentlevel > 0) { tocList += "</ol>"; currentlevel--; }

        // 目次のHTMLブロックを準備
        var tocHtml = '';
        if (tocList !== '') {
            tocHtml = '<div id="toc"><div class="mokuji">目次</div>' + tocList + '</div>';
        }
        
        // テンプレートの一番上にある「元々の空の目次箱」を完全に消去する
        $("#toc").remove();

        // --- 2. はてなブログカード化 ＆ カテゴリータグ付与 ＆ ★目次の直接埋め込み ---
        var isTocInserted = false;
        var isCategoryAdded = false;

        $('.main').each(function(){
            var html = $(this).html();
            
            // ブログカード化
            html = html.replace(/(<[^>]+>)|(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, function(match, tag, url) {
                if (tag) return tag;
                return '<iframe class="hatenablogcard" style="width:100%;height:155px;max-width:680px;" src="https://hatenablog-parts.com/embed?url=' + url + '" frameborder="0" scrolling="no"></iframe>';
            });
            
            // ★最強の目次挿入ロジック：HTML文字列の中で最初のH2を探し、その直前に目次をねじ込む
            if (tocHtml !== '' && !isTocInserted) {
                // H2タグ（属性付き・大文字小文字問わず）があるかチェック
                if (/(<h2[^>]*>)/i.test(html)) {
                    // 最初のH2の直前に目次のHTMLを挿入
                    html = html.replace(/(<h2[^>]*>)/i, "\n" + tocHtml + "\n$1");
                    isTocInserted = true;
                }
            }
            
            // カテゴリータグ処理
            if (settings.hasCategory) {
                var categoryHtml = '<div class="modern-cat-tag"><span class="cat-label"><i class="fas fa-folder"></i> カテゴリー</span> <a href="' + settings.categoryUrl + '">' + settings.categoryName + '</a></div>';
                var tagRegex = /タグ[ 　]*[:：]/; 
                if (tagRegex.test(html)) {
                    html = html.replace(tagRegex, categoryHtml + '<div class="modern-cat-tag"><span class="cat-label"><i class="fas fa-tags"></i> タグ</span> ');
                    html += '</div>';
                    isCategoryAdded = true;
                }
            }
            
            // 書き換えたHTMLを画面に戻す
            $(this).html(html);
        });
        
        if (settings.hasCategory && !isCategoryAdded) {
            $('.main:last').append('<div class="modern-cat-tag"><span class="cat-label"><i class="fas fa-folder"></i> カテゴリー</span> <a href="' + settings.categoryUrl + '">' + settings.categoryName + '</a></div>');
        }

        // --- 3. 画像のクラス追加 ---
        $('img').addClass('imgclass');

        // --- 4. 読了時間の算出 ---
        const MIN_CHAR = 500;
        var blogText = $('.main').text();
        var readTime = Math.max(1, Math.floor(blogText.length / MIN_CHAR));
        $('#read-cnt-area').html('<span style="color: #666; font-size: 13px;"><i class="far fa-clock"></i> この記事は約' + readTime + '分で読めます</span>');

        // --- 5. LINE風コメント欄の管理者振り分け ---
        var myAdminName = settings.adminName || "管理者"; 
        var $bodies = $('.line-chat-box .comments-body');
        
        $('.line-chat-box .comments-post').each(function(index) {
            var $post = $(this);
            var $body = $bodies.eq(index); 
            if ($body.length === 0) return;

            var text = $post.text() || "";
            var $wrapper = $('<div class="line-comment-wrapper"></div>');
            $body.before($wrapper);
            $wrapper.append($body).append($post);

            if (text.indexOf(myAdminName) !== -1) {
                $body.addClass('line-bubble-admin');
                $post.addClass('line-meta-admin');
            } else {
                $body.addClass('line-bubble-user');
                $post.addClass('line-meta-user');
            }
        });

        // --- 6. 記事内 吹き出し自動生成スクリプト ---
        var personA = settings.personA || { name: "Aさん", img: "" };
        var personB = settings.personB || { name: "Bさん", img: "" };

        $('.chat-a').each(function() {
            var text = $(this).html();
            $(this).replaceWith('<div class="balloon-box"><div class="balloon-icon"><img src="' + personA.img + '" alt=""><p>' + personA.name + '</p></div><div class="balloon-text">' + text + '</div></div>');
        });

        $('.chat-b').each(function() {
            var text = $(this).html();
            $(this).replaceWith('<div class="balloon-box is-right"><div class="balloon-icon"><img src="' + personB.img + '" alt=""><p>' + personB.name + '</p></div><div class="balloon-text">' + text + '</div></div>');
        });
    });
}
