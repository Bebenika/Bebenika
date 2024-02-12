
using BbnkBase;
using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Text;

public class SQLiteHelper:SqlHelper
{
    public string DatabasePath { get; private set; }

    public SQLiteHelper(string name,string connectionstring):base(name,connectionstring)
    {
        //Bunda connectionstring path olarak kullan?l?yor
        DatabasePath = connectionstring;
        if (!File.Exists(DatabasePath))
        {
            SQLiteConnection.CreateFile(DatabasePath);


        }
    }

    private SQLiteConnection CreateConnection()
    {
        return new SQLiteConnection($"Data Source={DatabasePath};Version=3;");
    }

    public override void CreateTable(string tableName, Dictionary<string, string> columns)
    {
        using (var connection = CreateConnection())
        {
            connection.Open();
            var command = new SQLiteCommand(connection);
            var columnDefinitions = columns.Select(kv => $"{kv.Key} {kv.Value}").Aggregate((a, b) => $"{a}, {b}");
            command.CommandText = $"CREATE TABLE IF NOT EXISTS {tableName} ({columnDefinitions})";
            command.ExecuteNonQuery();
        }
    }
    public override bool TableExists(string tableName)
    {
        using (var connection = CreateConnection())
        {
            connection.Open();
            var query = $"SELECT name FROM sqlite_master WHERE type='table' AND name=@tableName";
            using (var command = new SQLiteCommand(query, connection))
            {
                command.Parameters.AddWithValue("@tableName", tableName);
                using (var reader = command.ExecuteReader())
                {
                    return reader.Read(); // E?er herhangi bir sonuç dönerse, tablo mevcuttur.
                }
            }
        }
    }

    public override void Insert(string tableName, Dictionary<string, object> data, params Qprm[] parameters)
    {
        using (var connection = CreateConnection())
        {
            connection.Open();
            var command = new SQLiteCommand(connection);
            var columns = string.Join(", ", data.Keys);
            var placeholders = string.Join(", ", data.Keys.Select(k => $"@{k}"));
            command.CommandText = $"INSERT INTO {tableName} ({columns}) VALUES ({placeholders})";

            foreach (var param in parameters)
            {
                command.Parameters.AddWithValue($"@{param.Name}", param.Value);
            }

            command.ExecuteNonQuery();
        }
    }

    public override void Update(string tableName, Dictionary<string, object> data, string whereClause, params Qprm[] parameters)
    {
        using (var connection = CreateConnection())
        {
            connection.Open();
            var command = new SQLiteCommand(connection);
            var setClause = string.Join(", ", data.Select(kv => $"{kv.Key} = @{kv.Key}"));

            command.CommandText = $"UPDATE {tableName} SET {setClause} WHERE {whereClause}";

            foreach (var param in parameters)
            {
                command.Parameters.AddWithValue($"@{param.Name}", param.Value);
            }

            command.ExecuteNonQuery();
        }
    }

    public override void Delete(string tableName, string whereClause, params Qprm[] parameters)
    {
        using (var connection = CreateConnection())
        {
            connection.Open();
            var command = new SQLiteCommand(connection);
            command.CommandText = $"DELETE FROM {tableName} WHERE {whereClause}";

            foreach (var param in parameters)
            {
                command.Parameters.AddWithValue($"@{param.Name}", param.Value);
            }

            command.ExecuteNonQuery();
        }
    }

    public override List<Dictionary<string, object>> Select(string tableName, string whereClause = "", params Qprm[] parameters)
    {
        var records = new List<Dictionary<string, object>>();
        using (var connection = CreateConnection())
        {
            connection.Open();
            var command = new SQLiteCommand(connection);
            command.CommandText = $"SELECT * FROM {tableName} {(string.IsNullOrEmpty(whereClause) ? "" : $"WHERE {whereClause}")}";

            foreach (var param in parameters)
            {
                command.Parameters.AddWithValue($"@{param.Name}", param.Value);
            }

            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var record = new Dictionary<string, object>();
                    for (int i = 0; i < reader.FieldCount; i++)
                    {
                        record[reader.GetName(i)] = reader.GetValue(i);
                    }
                    records.Add(record);
                }
            }
        }
        return records;
    }
    public override void RenameTable(string oldTableName, string newTableName)
    {
        using (var connection = CreateConnection())
        {
            connection.Open();
            var command = new SQLiteCommand($"ALTER TABLE {oldTableName} RENAME TO {newTableName};", connection);
            command.ExecuteNonQuery();
        }
    }
    public override void AlterTable(string tableName, string tempTableName, string columnsToCopy, string newColumnDefinitions)
    {
        using (var connection = CreateConnection())
        {
            connection.Open();

            using (var transaction = connection.BeginTransaction())
            {
                var createTempTableCmd = new SQLiteCommand($"CREATE TABLE {tempTableName} ({newColumnDefinitions});", connection);
                createTempTableCmd.ExecuteNonQuery();

                var copyDataCmd = new SQLiteCommand($"INSERT INTO {tempTableName} ({columnsToCopy}) SELECT {columnsToCopy} FROM {tableName};", connection);
                copyDataCmd.ExecuteNonQuery();

                var dropOldTableCmd = new SQLiteCommand($"DROP TABLE {tableName};", connection);
                dropOldTableCmd.ExecuteNonQuery();

                var renameTableCmd = new SQLiteCommand($"ALTER TABLE {tempTableName} RENAME TO {tableName};", connection);
                renameTableCmd.ExecuteNonQuery();

                transaction.Commit();
            }
        }
    }

}



