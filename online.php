<?php

try {

    $DB = new PDO("mysql:host=localhost;dbname=snakejs;charset=utf8", "root", "root");
    
    online($DB);
 
 } catch(Exception $e) {
     die($e->getMessage());
 }

/**
 * @param int $number min = 10, max = 100.
 */
function getScores(PDO $db, int $number = 10): string {

    $table = "scores";
    $query = $db->prepare("SELECT id, player, score FROM $table ORDER BY score DESC LIMIT :nb");

    if ($number < 10 || $number > 100) return "This action isn't authorized.";

    $query->bindParam(":nb", $number, PDO::PARAM_INT);
    $query->execute();

    return json_encode($query->fetchAll());
}

function recordScore(PDO $db, string $player, int $score): void {

    $table = "scores";
    $query = $db->prepare("INSERT INTO $table (player, score) VALUES (:player, :score)");

    $query->bindParam(":player", $player, PDO::PARAM_STR);
    $query->bindParam(":score", $score, PDO::PARAM_INT);

    $query->execute();
}

function online(PDO $db) {

    /**
     * Retrieve last X scores with ?scores=x in ASC order.
     * Min = 10, Max = 100.
     * Return JSON format.
     */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        if( isset($_GET["scores"])
            && !empty($_GET["scores"])
            && intval($_GET["scores"])
            && $_GET["scores"] >= 10
            && $_GET["scores"] <= 100
        ){
            echo getScores($db, $_GET["scores"]);

        } else {

            throw new Exception("This action isn't authorized.");
        }


    } else if ($_SERVER["REQUEST_METHOD"] === "POST") {

        // dump($_COOKIE , 1);
        // dump($_POST , 1);
        if (isset($_POST["score"])
            && !empty($_POST["score"])
            && intval($_POST["score"]) >= 0
            && intval($_POST["score"]) < 1000000
            && isset($_POST["token"])
            && isset($_COOKIE["token"])
            && $_POST["token"] == $_COOKIE["token"]
            && isset($_COOKIE["bestScore"])
            && $_COOKIE["bestScore"] == $_POST["score"]
            && isset($_POST["player"])
            && !empty($_POST["player"])
        ){
            if(preg_match("/^[a-zA-Z]{3,16}$/", $_POST["player"])
            ){
                recordScore($db, $_POST["player"],  intval($_POST["score"]));
                echo "success";
                
            } else {

                echo "invalidName";
                return;
            }

        } else {

        }

    } else {
        throw new Exception("This action isn't authorized.");
    }
}