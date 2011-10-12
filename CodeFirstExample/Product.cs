using NakedObjects;
using System.ComponentModel.DataAnnotations;
namespace CodeFirstExample
{
    /// <summary>
    /// 
    /// </summary>
    public class Product
    {
        [Hidden]
        public virtual int Id { get; set; }

        [StringLength(50), Title]
        public virtual string Name { get; set; }

        [Mask("c")]
        public virtual decimal UnitPrice { get; set; }
      
    }
}
