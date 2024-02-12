using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BbnkBase
{

    //Genel Bir Sql Helper Yaptim Alışkanlık işte

    public class SqlHelper:Cbbnk
    {


        public SqlHelper(string name, string connectionstring) : base(name)
        {
            _ConnectionString = connectionstring;
            
        }
        private string _ConnectionString;
        public string ConnectionString
        {
            get { return _ConnectionString;}
        }


        public virtual void CreateTable(string tableName, Dictionary<string, string> columns)
        {
          
        }
        public virtual  bool TableExists(string tableName)
        {
            return false;
        }
        public virtual void Insert(string tableName, Dictionary<string, object> data, params Qprm[] parameters)
        {
           
        }

        public virtual void Update(string tableName, Dictionary<string, object> data, string whereClause, params Qprm[] parameters)
        {
            
        }

        public virtual void Delete(string tableName, string whereClause, params Qprm[] parameters)
        {
            
        }

        public virtual List<Dictionary<string, object>> Select(string tableName, string whereClause = "", params Qprm[] parameters)
        {
            List < Dictionary<string, object> > res=new List<Dictionary<string, object>>();
            return res;
        }
        public virtual void RenameTable(string oldTableName, string newTableName)
        {
            
        }
        public virtual  void AlterTable(string tableName, string tempTableName, string columnsToCopy, string newColumnDefinitions)
        {
           
        }

    }



    // Query ler parametre yollamak icin 
    // Bunu Buraya Taşıdım
    public class Qprm
    {
        public static Qprm P(string name, object value)
        {
            return new Qprm(name, value);
        }
        public string Name { get; set; }
        public object Value { get; set; }

        public Qprm(string name, object value)
        {
            Name = name;
            Value = value;
        }
    }

}
